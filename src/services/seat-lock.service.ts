import { getRedis } from "../config/redis";

const LOCK_PREFIX = "seat:lock";

const buildKey = (showId: string, seat: string): string => `${LOCK_PREFIX}:${showId}:${seat.toUpperCase()}`;

/** Atomically acquire all seat locks or roll back partial acquisitions. */
const ACQUIRE_SCRIPT = `
local holdId = ARGV[1]
local userId = ARGV[2]
local ttl = tonumber(ARGV[3])
local value = holdId .. "|" .. userId
local acquired = {}

for i = 1, #KEYS do
  local ok = redis.call("SET", KEYS[i], value, "NX", "EX", ttl)
  if ok then
    table.insert(acquired, KEYS[i])
  else
    for j = 1, #acquired do
      redis.call("DEL", acquired[j])
    end
    return 0
  end
end

return 1
`;

/** Release locks only when they belong to the given hold. */
const RELEASE_SCRIPT = `
local holdId = ARGV[1]
local released = 0

for i = 1, #KEYS do
  local current = redis.call("GET", KEYS[i])
  if current then
    local sep = string.find(current, "|", 1, true)
    local currentHoldId = sep and string.sub(current, 1, sep - 1) or current
    if currentHoldId == holdId then
      redis.call("DEL", KEYS[i])
      released = released + 1
    end
  end
end

return released
`;

export const seatLockService = {
  async acquire(showId: string, seats: string[], holdId: string, userId: string, ttlSeconds: number): Promise<boolean> {
    if (seats.length === 0) return true;

    const redis = getRedis();
    const keys = seats.map((seat) => buildKey(showId, seat));
    const result = await redis.eval(ACQUIRE_SCRIPT, keys.length, ...keys, holdId, userId, String(ttlSeconds));
    return Number(result) === 1;
  },

  async release(showId: string, seats: string[], holdId: string): Promise<number> {
    if (seats.length === 0) return 0;

    const redis = getRedis();
    const keys = seats.map((seat) => buildKey(showId, seat));
    const result = await redis.eval(RELEASE_SCRIPT, keys.length, ...keys, holdId);
    return Number(result);
  },

  async releaseForHold(showId: string, seats: string[], holdId: string): Promise<void> {
    await this.release(showId, seats, holdId);
  },

  async isSeatLocked(showId: string, seat: string): Promise<boolean> {
    const value = await getRedis().get(buildKey(showId, seat));
    return value !== null;
  }
};
