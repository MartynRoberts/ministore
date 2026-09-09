import Link from "next/link";
import { PageContainer } from "@/components/ui/Layout";
import { getCurrentSessionId } from "@/app/actions/shop";
import { getShopStore } from "@/lib/shop-store";
import { formatMoney } from "@/lib/money";
export default async function OrdersPage() {
  const sessionId = await getCurrentSessionId();
  const orders = sessionId ? getShopStore().listOrders(sessionId) : [];
  return <PageContainer className="max-w-4xl"><h1 className="mb-6 text-2xl font-bold">Your orders</h1>
    {!orders.length && <p>You have no orders in this session.</p>}
    {orders.map(order => <Link key={order.id} href={`/orders/${order.id}`} className="mb-4 block rounded border p-4"><p className="break-all font-semibold">{order.id}</p><p>{new Date(order.createdAt).toLocaleDateString("en-GB")} · {order.status} · {formatMoney(order.quote.total)}</p></Link>)}
    <Link href="/products" className="underline">Continue shopping</Link>
  </PageContainer>;
}
