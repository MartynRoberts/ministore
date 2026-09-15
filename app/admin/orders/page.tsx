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
    await store.seedInventory(await getCheckoutProducts());
  } catch {
    inventoryWarning = "Supplier stock could not be loaded. Existing local inventory is still available.";
  }
  const orders = await store.listOrders();
  const inventory = await store.inventory();
  return <PageContainer className="max-w-5xl">
    <div className="flex items-start justify-between gap-4"><h1 className="text-2xl font-bold">Order management</h1><form action={logoutAdmin} className="shrink-0"><Button type="submit" variant="ghost" size="sm" className="whitespace-nowrap">Sign out</Button></form></div>
    <p className="my-4">Demo payments and fulfilment. Showing the most recent 200 orders.</p>
    {!orders.length && <p>No orders yet.</p>}
    {orders.map(order => <section key={order.id} className="my-4 overflow-hidden rounded-lg border border-border bg-surface">
      <div className="border-b border-border bg-surface-muted p-4">
        <span className="block text-xs font-semibold uppercase tracking-wide text-text-muted">Order</span>
        <h2 className="mt-1 break-all text-sm font-bold sm:text-base">{order.id}</h2>
      </div>
      <div className="p-4">
      <div className="space-y-1">
        <p className="font-semibold">{order.customer.name}</p>
        <p className="break-all text-sm text-text-muted">{order.customer.email}</p>
        <p className="text-sm text-text-muted">{order.customer.address}, {order.customer.city}, {order.customer.postcode}</p>
      </div>
      <dl className="my-5 grid grid-cols-2 gap-3 rounded-md bg-surface-muted p-3 sm:grid-cols-3">
        <div><dt className="text-xs text-text-muted">Status</dt><dd className="mt-1 font-semibold capitalize">{order.status}</dd></div>
        <div><dt className="text-xs text-text-muted">Payment</dt><dd className="mt-1 capitalize">{order.paymentStatus}</dd></div>
        <div><dt className="text-xs text-text-muted">Total</dt><dd className="mt-1 font-semibold">{formatMoney(order.quote.total)}</dd></div>
      </dl>
      <h3 className="text-sm font-semibold">Items</h3>
      <ul className="mt-2 divide-y divide-border">{order.quote.lines.map(line => <li key={line.variantId} className="flex justify-between gap-4 py-2 text-sm"><span>{line.title} <span className="text-text-muted">/ {line.variantLabel}</span></span><span className="shrink-0 font-medium">× {line.quantity}</span></li>)}</ul>
      <OrderControls id={order.id} status={order.status!} admin />
      <details className="mt-3 border-t border-border pt-2"><summary className="flex min-h-11 cursor-pointer items-center font-medium">Status history</summary><ul className="space-y-2 pb-2 text-sm text-text-muted">{order.events!.map((event, index) => <li key={index}>{event.at} — {event.status}: {event.note}</li>)}</ul></details>
      </div>
    </section>)}
    <h2 className="mb-4 mt-10 text-xl font-bold">Inventory</h2>
    <p className="mb-4">Stock is shared across shoppers and demo size variants. Set products to zero or low stock to exercise checkout failures. Active reservations prevent stock being reduced below the reserved quantity.</p>
    {inventoryWarning && <StatusMessage role="status" tone="warning" className="mb-4">{inventoryWarning}</StatusMessage>}
    <table className="block w-full text-left md:table">
      <thead className="hidden md:table-header-group">
        <tr><th>Product</th><th>Edit on hand</th><th>Reserved</th><th>Available</th></tr>
      </thead>
      <tbody className="grid gap-4 md:table-row-group">
        {inventory.map(item => <tr key={item.productId} className="grid gap-3 rounded-lg border border-border bg-surface p-4 align-top md:table-row md:rounded-none md:border-x-0 md:border-b-0 md:bg-transparent md:p-0">
          <td className="block font-semibold md:table-cell md:py-3 md:pr-4 md:font-normal">
            <span className="mb-1 block text-sm font-normal text-text-muted md:hidden">Product</span>
            {item.title}
          </td>
          <td className="block min-w-0 md:table-cell md:py-3 md:pr-4">
            <span className="mb-2 block text-sm text-text-muted md:hidden">Edit on hand</span>
            <InventoryControls key={`${item.productId}-${item.stock}`} productId={item.productId} title={item.title} stock={item.stock} />
          </td>
          <td className="flex items-center justify-between gap-4 md:table-cell md:py-3 md:pr-4">
            <span className="text-sm text-text-muted md:hidden">Reserved</span>
            {item.reserved}
          </td>
          <td className="flex items-center justify-between gap-4 md:table-cell md:py-3">
            <span className="text-sm text-text-muted md:hidden">Available</span>
            {item.available}
          </td>
        </tr>)}
      </tbody>
    </table>
  </PageContainer>;
}
