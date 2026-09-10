import BasketClient from "./BasketClient";
import { api } from "@/lib/api";

export default async function BasketPage() {
  const products = await api.getProducts();
  return <BasketClient recommendations={products.slice(0, 4)} />;
}
