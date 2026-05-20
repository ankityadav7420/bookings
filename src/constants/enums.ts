export const SEAT_CATEGORIES = ["gold", "platinum", "recliner"] as const;
export type SeatCategory = (typeof SEAT_CATEGORIES)[number];
