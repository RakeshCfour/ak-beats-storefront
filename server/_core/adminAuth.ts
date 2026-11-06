import { createHash, timingSafeEqual } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import type { Request, Response } from "express";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

export const ADMIN_COOKIE = "ak_void_admin";
const ADMIN_USERNAME = "admin";

function secretKey() {
  return new TextEncoder().encode(ENV.cookieSecret || "ak-void-change-this-secret");
}

function configuredPassword() {
  return process.env.ADMIN_PASSWORD || "akbeats2026";
}

function digest(value: string) {
  return createHash("sha256").update(value).digest();
}

export function isAdminCredentials(username: string, password: string) {
  if (username !== ADMIN_USERNAME) return false;
  const expected = digest(configuredPassword());
  const received = digest(password);
  return timingSafeEqual(expected, received);
}

export async function issueAdminSession(res: Response, req: Request) {
  const token = await new SignJWT({ scope: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(ADMIN_USERNAME).setIssuedAt().setExpirationTime("8h").sign(secretKey());
  res.cookie(ADMIN_COOKIE, token, { ...getSessionCookieOptions(req), maxAge: 8 * 60 * 60 * 1000 });
}

export async function hasAdminSession(req: Request) {
  const raw = req.headers.cookie?.split(";").map(value => value.trim()).find(value => value.startsWith(`${ADMIN_COOKIE}=`))?.slice(ADMIN_COOKIE.length + 1);
  if (!raw) return false;
  try {
    const { payload } = await jwtVerify(raw, secretKey());
    return payload.scope === "admin" && payload.sub === ADMIN_USERNAME;
  } catch {
    return false;
  }
}

export function clearAdminSession(res: Response, req: Request) {
  res.clearCookie(ADMIN_COOKIE, { ...getSessionCookieOptions(req), maxAge: -1 });
}

export { ADMIN_USERNAME };
