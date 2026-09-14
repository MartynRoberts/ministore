"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, createAdminToken, isAdmin, sameSecret, validAdminPasswordLength } from "@/lib/admin-auth";
import { getShopStore } from "@/lib/shop-store";
import { getCurrentSessionId } from "./shop";
import { orderTransitions, type OrderStatus } from "@/lib/order-status";

type Result = { error?: string; success?: string };
let attempts = { count: 0, since: 0 };
export async function loginAdmin(_previous: Result, form: FormData): Promise<Result> {
  if (Date.now() - attempts.since > 60000) attempts = { count: 0, since: Date.now() };
  if (++attempts.count > 5) return { error: "Too many attempts. Please wait a minute." };
  const password = form.get("password");
  const configured = process.env.MINISTORE_ADMIN_PASSWORD ?? "";
  if (!validAdminPasswordLength(configured)) {
    return { error: "Admin access is not configured. Set MINISTORE_ADMIN_PASSWORD to 8–128 characters and restart the server." };
  }
  if (typeof password !== "string" || !validAdminPasswordLength(password) || !sameSecret(password, configured)) {
    return { error: "The password is incorrect. Try again." };
  }
  (await cookies()).set(ADMIN_COOKIE, createAdminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8 * 60 * 60 });
  attempts.count = 0;
  redirect("/admin/orders");
}
export async function logoutAdmin() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/orders");
}
function status(value: FormDataEntryValue | null): OrderStatus {
  if (typeof value !== "string" || !Object.hasOwn(orderTransitions, value)) throw new Error("Invalid order status.");
  return value as OrderStatus;
}
async function changeOrder(form: FormData, sessionId?: string): Promise<Result> {
  try {
    const id = form.get("id");
    if (typeof id !== "string" || id.length > 100) throw new Error("Invalid order.");
    const target = sessionId === undefined ? status(form.get("status")) : "cancelled";
    await getShopStore().transitionOrder(id, target, status(form.get("expected")), sessionId);
    revalidatePath("/", "layout");
    return { success: "Order updated." };
  } catch (error) { return { error: error instanceof Error ? error.message : "Unable to update order." }; }
}
export async function updateOrder(_previous: Result, form: FormData): Promise<Result> {
  if (!await isAdmin()) return { error: "Administrator sign-in required." };
  return changeOrder(form);
}
export async function updateInventory(_previous: Result, form: FormData): Promise<Result> {
  if (!await isAdmin()) return { error: "Administrator sign-in required." };
  const integer = (name: string) => {
    const value = form.get(name);
    if (typeof value !== "string" || !/^\d+$/.test(value)) throw new Error("Stock must be a whole number.");
    return Number(value);
  };
  try {
    await getShopStore().updateInventoryStock(integer("productId"), integer("stock"), integer("expectedStock"));
    revalidatePath("/admin/orders");
    return { success: "Stock updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unable to update stock." };
  }
}
export async function cancelOrder(_previous: Result, form: FormData): Promise<Result> {
  const sessionId = await getCurrentSessionId();
  if (!sessionId) return { error: "Please return to your order history." };
  return changeOrder(form, sessionId);
}
