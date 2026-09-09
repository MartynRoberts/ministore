import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ministore_admin";
export const ADMIN_PASSWORD_MIN_LENGTH = 8;
export const ADMIN_PASSWORD_MAX_LENGTH = 128;
const secret = () => process.env.MINISTORE_ADMIN_PASSWORD ?? "";
export function validAdminPasswordLength(value: string) {
  return value.length >= ADMIN_PASSWORD_MIN_LENGTH && value.length <= ADMIN_PASSWORD_MAX_LENGTH;
}
export function sameSecret(a: string, b: string) {
  const left = Buffer.from(a), right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function createAdminToken() {
  if (!validAdminPasswordLength(secret())) {
    throw new Error("Configure an admin password between 8 and 128 characters.");
  }
  const expiry = String(Date.now() + 8 * 60 * 60 * 1000);
  return `${expiry}.${createHmac("sha256", secret()).update(expiry).digest("hex")}`;
}
export function validAdminToken(token: string) {
  if (!validAdminPasswordLength(secret())) return false;
  const [expiry, signature, extra] = token.split(".");
  if (extra || !expiry || !signature || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now()) return false;
  return sameSecret(signature, createHmac("sha256", secret()).update(expiry).digest("hex"));
}
export async function isAdmin() {
  return validAdminToken((await cookies()).get(ADMIN_COOKIE)?.value ?? "");
}
