export type Product = {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
};

export type Basket = Record<number, number>; // productId -> qty