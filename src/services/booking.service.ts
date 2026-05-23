import mongoose, { Types } from "mongoose";
import { Booking } from "../models/Booking";
import { Payment } from "../models/Payment";
import { SeatHold } from "../models/SeatHold";
import { SeatReservation } from "../models/SeatReservation";
import { Show } from "../models/Show";
import { Theater } from "../models/Theater";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { generateBookingCode } from "../utils/code";
import { notificationService } from "./notification.service";

const HOLD_MINUTES = 8;
const CONVENIENCE_FEE_RATE = 0.05;

const normalizeSeat = (seat: string): string => seat.trim().toUpperCase();
const now = (): Date => new Date();

const getScreenSeats = async (showId: string) => {
  const show = await Show.findById(showId).populate("theater");
  if (!show) throw new ApiError(404, "Show not found");
  if (show.status === "cancelled" || show.startsAt < new Date()) {
    throw new ApiError(400, "Show is not available for booking");
  }

  const theater = await Theater.findById(show.theater);
  const screen = theater?.screens.find((item) => item.name === show.screenName);
  if (!theater || !screen) throw new ApiError(404, "Screen not found for this show");

  return { show, theater, seats: screen.seats };
};

const calculateAmount = (selectedSeats: string[], screenSeats: Awaited<ReturnType<typeof getScreenSeats>>["seats"], show: Awaited<ReturnType<typeof getScreenSeats>>["show"]) => {
  const seatMap = new Map(screenSeats.map((seat) => [`${seat.row}${seat.number}`, seat]));
  let amount = 0;

  for (const seatNo of selectedSeats) {
    const seat = seatMap.get(seatNo);
    if (!seat || !seat.isActive) {
      throw new ApiError(400, `Seat ${seatNo} does not exist or is inactive`);
    }
    const tier = show.prices.find((price) => price.seatType === seat.type);
    if (!tier) throw new ApiError(400, `Price is not configured for ${seat.type} seats`);
    amount += tier.price;
  }

  const convenienceFee = Math.round(amount * CONVENIENCE_FEE_RATE);
  return { amount, convenienceFee, totalAmount: amount + convenienceFee };
};

export const bookingService = {
  async getSeatMap(showId: string) {
    const { seats } = await getScreenSeats(showId);
    await this.releaseExpiredHolds(showId);
    const reservations = await SeatReservation.find({
      show: showId,
      $or: [{ status: "booked" }, { status: "held", expiresAt: { $gt: now() } }]
    });
    const reservedMap = new Map(reservations.map((reservation) => [reservation.seat, reservation.status]));

    return seats.map((seat) => {
      const seatNo = `${seat.row}${seat.number}`;
      return {
        seat: seatNo,
        row: seat.row,
        number: seat.number,
        type: seat.type,
        category: seat.type,
        isActive: seat.isActive,
        status: !seat.isActive ? "blocked" : reservedMap.get(seatNo) ?? "available"
      };
    });
  },

  async holdSeats(userId: string, showId: string, rawSeats: string[]) {
    const selectedSeats = [...new Set(rawSeats.map(normalizeSeat))];
    if (selectedSeats.length === 0) throw new ApiError(400, "At least one seat is required");

    const session = await mongoose.startSession();
    try {
      return await session.withTransaction(async () => {
        const { show, theater, seats } = await getScreenSeats(showId);
        const totals = calculateAmount(selectedSeats, seats, show);
        const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

        await this.releaseExpiredHolds(String(show._id), session);

        const hold = await SeatHold.create(
          [
            {
              user: userId,
              show: show._id,
              seats: selectedSeats,
              status: "held",
              expiresAt
            }
          ],
          { session }
        );

        try {
          await SeatReservation.insertMany(
            selectedSeats.map((seat) => ({
              show: show._id,
              seat,
              user: userId,
              hold: hold[0]._id,
              status: "held",
              expiresAt
            })),
            { session, ordered: true }
          );
        } catch (error: any) {
          if (error.code === 11000) {
            throw new ApiError(409, "One or more selected seats are already held or booked");
          }
          throw error;
        }

        const booking = await Booking.create(
          [
            {
              bookingCode: generateBookingCode(),
              user: userId,
              show: show._id,
              movie: show.movie,
              theater: theater._id,
              seats: selectedSeats,
              ...totals,
              status: "pending_payment"
            }
          ],
          { session }
        );

        await SeatHold.updateOne({ _id: hold[0]._id }, { booking: booking[0]._id }, { session });
        await SeatReservation.updateMany({ hold: hold[0]._id }, { booking: booking[0]._id }, { session });

        return {
          hold: hold[0],
          booking: booking[0],
          expiresAt,
          message: "Seats held. Complete payment before hold expiry."
        };
      });
    } finally {
      await session.endSession();
    }
  },

  async getUserBookings(userId: string) {
    return Booking.find({ user: userId })
      .populate("movie", "title posterUrl language")
      .populate("theater", "name city")
      .populate("show", "startsAt screenName")
      .sort({ createdAt: -1 });
  },

  async getBookingForUser(userId: string, userRole: string, bookingId: string) {
    const booking = await Booking.findOne({
      _id: bookingId,
      ...(userRole === "admin" ? {} : { user: userId })
    })
      .populate("movie", "title posterUrl language durationMinutes")
      .populate("theater", "name city address")
      .populate("show", "startsAt screenName")
      .populate("payment");

    if (!booking) throw new ApiError(404, "Booking not found");
    return booking;
  },

  async confirmBooking(userId: string, providerOrderId: string, providerPaymentId: string, providerSignature: string) {
    const session = await mongoose.startSession();
    let confirmedBookingId: Types.ObjectId | undefined;
    try {
      const confirmedBooking = await session.withTransaction(async () => {
        const payment = await Payment.findOne({ providerOrderId }).session(session);
        if (!payment) throw new ApiError(404, "Payment order not found");
        if (String(payment.user) !== userId) throw new ApiError(403, "Payment does not belong to this user");

        const booking = await Booking.findById(payment.booking).session(session);
        if (!booking) throw new ApiError(404, "Booking not found");
        if (payment.status === "paid") {
          if (payment.providerPaymentId !== providerPaymentId || payment.providerSignature !== providerSignature) {
            throw new ApiError(409, "Payment order is already paid");
          }
          return Booking.findById(booking._id)
            .populate("movie", "title language durationMinutes")
            .populate("theater", "name city address")
            .populate("show", "startsAt screenName")
            .session(session);
        }
        if (payment.status !== "created") throw new ApiError(400, "Payment order cannot be verified");
        if (booking.status !== "pending_payment") throw new ApiError(400, "Booking is not pending payment");

        const hold = await SeatHold.findOne({ booking: booking._id, status: "held", expiresAt: { $gt: now() } }).session(session);
        if (!hold) {
          await this.failBooking(String(booking._id), session);
          throw new ApiError(410, "Seat hold expired. Please select seats again.");
        }

        const paymentUpdate = await Payment.updateOne(
          { _id: payment._id, status: "created" },
          { status: "paid", providerPaymentId, providerSignature, paidAt: new Date() },
          { session }
        );
        if (paymentUpdate.modifiedCount !== 1) {
          throw new ApiError(409, "Payment is already being processed");
        }

        const bookingUpdate = await Booking.updateOne(
          { _id: booking._id, status: "pending_payment" },
          { status: "confirmed", confirmedAt: new Date(), payment: payment._id },
          { session }
        );
        if (bookingUpdate.modifiedCount !== 1) {
          throw new ApiError(409, "Booking is already being processed");
        }

        const reservationUpdate = await SeatReservation.updateMany(
          { hold: hold._id, show: booking.show, seat: { $in: booking.seats }, status: "held" },
          { status: "booked", booking: booking._id, $unset: { expiresAt: "" } },
          { session }
        );
        if (reservationUpdate.modifiedCount !== booking.seats.length) {
          throw new ApiError(409, "Could not confirm all selected seats");
        }
        await SeatHold.updateOne({ _id: hold._id }, { status: "booked" }, { session });

        confirmedBookingId = booking._id;
        return Booking.findById(booking._id)
          .populate("movie", "title language durationMinutes")
          .populate("theater", "name city address")
          .populate("show", "startsAt screenName")
          .session(session);
      });
      if (confirmedBookingId) {
        const [booking, user] = await Promise.all([Booking.findById(confirmedBookingId), User.findById(userId)]);
        if (booking && user) {
          notificationService
            .send({
              email: user.email,
              mobile: user.mobile,
              subject: "Booking confirmed",
              message: `Your booking ${booking.bookingCode} is confirmed for seats ${booking.seats.join(", ")}.`
            })
            .catch((error) => console.error("Failed to send booking notification", error));
        }
      }
      return confirmedBooking;
    } finally {
      await session.endSession();
    }
  },

  async failBooking(bookingId: string, session?: mongoose.ClientSession) {
    const booking = await Booking.findById(bookingId).session(session ?? null);
    if (!booking) return;
    await Booking.updateOne({ _id: booking._id }, { status: "failed" }, { session });
    const hold = await SeatHold.findOneAndUpdate({ booking: booking._id, status: "held" }, { status: "released" }, { session, new: true });
    await SeatReservation.deleteMany({
      status: "held",
      $or: [{ booking: booking._id }, ...(hold ? [{ hold: hold._id }] : [])]
    }).session(session ?? null);
  },

  async releaseExpiredHolds(showId?: string, session?: mongoose.ClientSession) {
    const expiredHolds = await SeatHold.find({
      ...(showId ? { show: showId } : {}),
      status: "held",
      expiresAt: { $lte: now() }
    })
      .select("_id booking")
      .session(session ?? null);
    if (expiredHolds.length === 0) return;

    const holdIds = expiredHolds.map((hold) => hold._id);
    const bookingIds = expiredHolds.flatMap((hold) => (hold.booking ? [hold.booking] : []));
    await SeatHold.updateMany({ _id: { $in: holdIds }, status: "held" }, { status: "expired" }, { session });
    await SeatReservation.deleteMany({ hold: { $in: holdIds }, status: "held" }).session(session ?? null);
    if (bookingIds.length > 0) {
      await Booking.updateMany({ _id: { $in: bookingIds }, status: "pending_payment" }, { status: "failed" }, { session });
      await Payment.updateMany({ booking: { $in: bookingIds }, status: "created" }, { status: "failed" }, { session });
    }
  },

  async cancelBooking(userId: string, bookingId: string, isAdmin = false) {
    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");
    if (!isAdmin && String(booking.user) !== userId) throw new ApiError(403, "Booking does not belong to this user");
    if (booking.status !== "confirmed") throw new ApiError(400, "Only confirmed bookings can be cancelled");

    booking.status = "cancelled";
    booking.cancelledAt = new Date();
    await booking.save();
    await SeatReservation.deleteMany({ booking: booking._id, status: "booked" });
    if (booking.payment) {
      await Payment.updateOne({ _id: booking.payment }, { status: "refunded" });
    }
    return booking;
  },

  toObjectId(id: string) {
    if (!Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid id");
    return new Types.ObjectId(id);
  }
};
