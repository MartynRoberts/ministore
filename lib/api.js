const BASE_URL = "https://fakestoreapi.com";

export const api = {
  async getProducts() {
    const res = await fetch(`${BASE_URL}/products`, {
      next: { revalidate: 60 } // cache + revalidate every 60s
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
};
