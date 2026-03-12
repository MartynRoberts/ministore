import { api } from "@/lib/api";
import ProductListClient from "./ProductListClient";

export default async function ProductListPage() {
  const products = await api.getProducts();

  return <ProductListClient products={products} />;
}