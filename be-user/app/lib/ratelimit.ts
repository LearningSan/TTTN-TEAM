import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const createLimiter = (requests: number, window: `${number} ${"s" | "m" | "h" | "d"}`) =>
  new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
  });

/**
 * 🔐 AUTH (rất nhạy cảm)
 */
export const loginLimiter = createLimiter(5, "15 m");
export const signupLimiter = createLimiter(5, "15 m");
export const otpLimiter = createLimiter(5, "10 m");
export const forgotPasswordLimiter = createLimiter(3, "10 m");

/**
 * 💰 PAYMENT (cực kỳ nhạy cảm)
 */
export const paymentLimiter = createLimiter(5, "1 m");
export const confirmPaymentLimiter = createLimiter(5, "1 m");
export const checkBalanceLimiter = createLimiter(10, "1 m");

/**
 * 🧾 ORDER
 */
export const orderCreateLimiter = createLimiter(5, "1 m");
export const orderReadLimiter = createLimiter(30, "1 m");

/**
 * 🎟 TICKET
 */
export const ticketLimiter = createLimiter(30, "1 m");

/**
 * 🎤 CONCERT (public search)
 */
export const concertLimiter = createLimiter(60, "1 m");

/**
 * 🪑 SEAT / ZONE (dễ bị spam khi chọn ghế)
 */
export const seatLimiter = createLimiter(40, "1 m");
export const zoneLimiter = createLimiter(40, "1 m");

/**
 * 👤 USER
 */
export const userLimiter = createLimiter(20, "1 m");