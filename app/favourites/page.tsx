import { api } from "@/lib/api";
import FavouritesClient from "./FavouritesClient";

export default async function FavouritesPage() {
  const products = await api.getProducts();

  return <FavouritesClient products={products} />;
}