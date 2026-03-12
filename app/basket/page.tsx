import { api } from "@/lib/api";
import BasketClient from "./BasketClient";

export default async function BasketPage() {
  const products = await api.getProducts();

  return <BasketClient products={products} />;
}