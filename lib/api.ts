import localProducts from "@/data/products.json";

const BASE_URL = "https://fakestoreapi.com";

export const api = {
  async getProducts() {
    try {
      const res = await fetch(`${BASE_URL}/products`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        console.error(`Products API failed: ${res.status}`);
        return localProducts;
      }

      return res.json();
    } catch {
      return localProducts;
    }
  },

  async getProduct(id: number) {
    try {
      const res = await fetch(`${BASE_URL}/products/${id}`, {
        next: { revalidate: 3600 },
      });

      if (!res.ok) {
        console.error(`Products API failed: ${res.status}`);
        return localProducts.find((p) => p.id === id) ?? null;
      }

      return res.json();
    } catch {
      return localProducts.find((p) => p.id === id) ?? null;
    }
  },
};