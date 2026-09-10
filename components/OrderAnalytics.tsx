"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

export default function OrderAnalytics({
  orderId,
  total,
  currency,
  itemCount,
  deliveryMethod,
  paymentStatus,
}: {
  orderId: string;
  total: number;
  currency: string;
  itemCount: number;
  deliveryMethod: string;
  paymentStatus: string;
}) {
  useEffect(() => {
    const storageKey = `ministore:analytics:order:${orderId}`;
    const send = () => {
      if (sessionStorage.getItem(storageKey)) return true;
      const sent = trackEvent("order_placed", { total, currency, item_count: itemCount, delivery_method: deliveryMethod, payment_status: paymentStatus });
      if (sent) sessionStorage.setItem(storageKey, "1");
      return sent;
    };
    if (send()) return;
    const interval = window.setInterval(() => {
      if (send()) window.clearInterval(interval);
    }, 250);
    const timeout = window.setTimeout(() => window.clearInterval(interval), 10000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [currency, deliveryMethod, itemCount, orderId, paymentStatus, total]);

  return null;
}
