import { connectDb } from "./config/db";
import { Booking } from "./models/Booking";
import { Movie } from "./models/Movie";
import { Payment } from "./models/Payment";
import { SeatHold } from "./models/SeatHold";
import { SeatReservation } from "./models/SeatReservation";
import { Show } from "./models/Show";
import { Theater } from "./models/Theater";
import { User } from "./models/User";

const createSeats = () => {
  const rows = ["A", "B", "C", "D", "E", "F"];
  return rows.flatMap((row, rowIndex) =>
    Array.from({ length: 10 }, (_value, index) => ({
      row,
      number: index + 1,
      type: rowIndex < 3 ? "regular" : rowIndex < 5 ? "premium" : "recliner",
      isActive: true
    }))
  );
};

const seed = async () => {
  await connectDb();
  await Promise.all([
    Booking.deleteMany({}),
    Payment.deleteMany({}),
    SeatHold.deleteMany({}),
    SeatReservation.deleteMany({}),
    Show.deleteMany({}),
    Theater.deleteMany({}),
    Movie.deleteMany({}),
    User.deleteMany({})
  ]);

  const [admin, user] = await User.create([
    {
      name: "Admin",
      email: "admin@example.com",
      mobile: "9999999999",
      password: "password123",
      role: "admin"
    },
    {
      name: "Demo User",
      email: "user@example.com",
      mobile: "8888888888",
      password: "password123",
      role: "user"
    }
  ]);

  const movie = await Movie.create({
    title: "Metro Nights",
    description: "A fast-paced city drama built for a packed Friday night show.",
    durationMinutes: 142,
    language: "Hindi",
    genres: ["Drama", "Thriller"],
    certificate: "UA",
    releaseDate: new Date(),
    posterUrl: "https://example.com/posters/metro-nights.jpg",
    trailerUrl: "https://example.com/trailers/metro-nights",
    cast: ["Asha Rao", "Kabir Mehta"],
    status: "running",
    createdBy: admin._id
  });

  const theater = await Theater.create({
    name: "Galaxy Cinemas",
    city: "Mumbai",
    address: "Andheri West, Mumbai",
    amenities: ["Parking", "Food Court", "Dolby Atmos"],
    screens: [{ name: "Screen 1", seats: createSeats() }],
    createdBy: admin._id
  });

  const startsAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const endsAt = new Date(startsAt.getTime() + movie.durationMinutes * 60 * 1000);

  const show = await Show.create({
    movie: movie._id,
    theater: theater._id,
    screenName: "Screen 1",
    startsAt,
    endsAt,
    prices: [
      { seatType: "regular", price: 180 },
      { seatType: "premium", price: 280 },
      { seatType: "recliner", price: 450 }
    ],
    createdBy: admin._id
  });

  console.log("Seed complete");
  console.log({ admin: admin.email, user: user.email, password: "password123", movie: movie._id, theater: theater._id, show: show._id });
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
