import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getProducts();
        if (!cancelled) setProducts(data);
      } catch (e) {
        if (!cancelled) setError(e.message ?? "Failed to load products");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, []);

  return { products, loading, error };
}
