import { env } from "../config/env";
import { bookingService } from "../services/booking.service";

let timer: NodeJS.Timeout | null = null;

export const startHoldExpiryJob = (): void => {
  if (timer) return;

  timer = setInterval(async () => {
    try {
      await bookingService.releaseExpiredHolds();
    } catch (error) {
      console.error("[hold-expiry] failed to release expired holds", error);
    }
  }, env.holdExpiryPollMs);

  timer.unref?.();
};

export const stopHoldExpiryJob = (): void => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};
