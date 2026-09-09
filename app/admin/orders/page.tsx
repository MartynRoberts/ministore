import { isAdmin } from "@/lib/admin-auth";
import { getShopStore } from "@/lib/shop-store";
import { formatMoney } from "@/lib/money";
import { logoutAdmin } from "@/app/actions/orders";
import OrderControls from "@/components/OrderControls";
import AdminLogin from "./AdminLogin";
import InventoryControls from "./InventoryControls";
import { getCheckoutProducts } from "@/lib/checkout-api";
import { Button } from "@/components/ui/Button";
import { PageContainer, StatusMessage } from "@/components/ui/Layout";
export default async function AdminOrdersPage() {
  if (!await isAdmin()) return <PageContainer className="max-w-4xl"><h1 className="mb-6 text-2xl font-bold">Admin sign-in</h1><AdminLogin /></PageContainer>;
  const store = getShopStore();
  let inventoryWarning = "";
  try {
    store.seedInventory(await getCheckoutProducts());
  } catch {
    inventoryWarning = "Supplier stock could not be loaded. Existing local inventory is still available.";
  }
  const orders = store.listOrders();
  const inventory = store.inventory();
  return <PageContainer className="max-w-5xl">
    <div className="flex justify-between"><h1 className="text-2xl font-bold">Order management</h1><form action={logoutAdmin}><Button type="submit" variant="ghost" size="sm">Sign out</Button></form></div>
    <p className="my-4">Demo payments and fulfilment. Showing the most recent 200 orders.</p>
    {!orders.length && <p>No orders yet.</p>}
    {orders.map(order => <section key={order.id} className="my-4 rounded-lg border border-border bg-surface p-4">
      <h2 className="break-all font-bold">{order.id}</h2>
      <p>{order.customer.name} — {order.customer.email}</p>
      <p>{order.customer.address}, {order.customer.city}, {order.customer.postcode}</p>
      <p className="my-2">Status: <strong>{order.status}</strong> · {order.paymentStatus} · {formatMoney(order.quote.total)}</p>
      <ul>{order.quote.lines.map(line => <li key={line.variantId}>{line.title} / {line.variantLabel} × {line.quantity}</li>)}</ul>
      <OrderControls id={order.id} status={order.status!} admin />
      <details><summary>Status history</summary><ul>{order.events!.map((event, index) => <li key={index}>{event.at} — {event.status}: {event.note}</li>)}</ul></details>
    </section>)}
    <h2 className="mb-4 mt-10 text-xl font-bold">Inventory</h2>
    <p className="mb-4">Stock is shared across shoppers and demo size variants. Set products to zero or low stock to exercise checkout failures. Active reservations prevent stock being reduced below the reserved quantity.</p>
    {inventoryWarning && <StatusMessage role="status" tone="warning" className="mb-4">{inventoryWarning}</StatusMessage>}
    <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Product</th><th>Edit on hand</th><th>Reserved</th><th>Available</th></tr></thead><tbody>{inventory.map(item => <tr key={item.productId} className="border-t align-top"><td className="py-3 pr-4">{item.title}</td><td className="py-3 pr-4"><InventoryControls key={`${item.productId}-${item.stock}`} productId={item.productId} title={item.title} stock={item.stock} /></td><td className="py-3 pr-4">{item.reserved}</td><td className="py-3">{item.available}</td></tr>)}</tbody></table></div>
  </PageContainer>;
}
