import { VercelRequest, VercelResponse } from "@vercel/node";
import { redis } from "./redis";

const allowedHosts = [
  "devamathacollege.ac.in",
  "www.devamathacollege.ac.in",
  "localhost",
];

export const toMails = [
  "codecavedevamatha@gmail.com"
]
const allowedOrigins = [
  "https://devamathacollege.ac.in",
  "https://www.devamathacollege.ac.in",
  "http://localhost",
  "http://localhost:8081",
];

export async function validateRequest(
  req: VercelRequest,
  res: VercelResponse,
): Promise<boolean> {
  
  try {
    const origin = req.headers.origin;

    if (!allowedOrigins.includes(origin || "")) {
      res.status(403).json({
        error: "Origin not allowed",
      });
      return false;
    }

    if (req.body.website) {
      res.status(400).json({
        error: "Bot detected",
      });
      return false;
    }

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] || "unknown";

    const currentCount = Number(await redis.get(`rate:${ip}`)) || 0;

    if (currentCount >= 5) {
      res.status(429).json({
        error: "Too many requests. Please try again later.",
      });
      return false;
    }

    await redis.set(`rate:${ip}`, currentCount + 1, {
      ex: 60 * 60,
    });

    const { turnstileToken } = req.body;

    if (!turnstileToken) {
      res.status(400).json({
        error: "Turnstile token missing",
      });
      return false;
    }

    const verifyResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.TURNSTILE_SECRET_KEY!,
          response: turnstileToken,
        }),
      },
    );

    const verification = await verifyResponse.json();

    if (!verification.success) {
      res.status(400).json({
        error: "Turnstile verification failed",
      });
      return false;
    }

    if (!allowedHosts.includes(verification.hostname)) {
      res.status(403).json({
        error: "Invalid hostname",
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Security validation failed",
    });

    return false;
  }
}
