export const orderTransitions = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: [],
  cancelled: [],
} as const;
export type OrderStatus = keyof typeof orderTransitions;
export type OrderEvent = { status: OrderStatus; at: string; note: string };
