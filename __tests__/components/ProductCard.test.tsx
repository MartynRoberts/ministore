import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductCard from "@/components/ProductCard";

const product = {
  id: 7,
  title: "Test product",
  description: "A useful product",
  category: "test-category",
  image: "/product.jpg",
  price: 12.99,
};

describe("ProductCard", () => {
  test("links to product details and formats the price", () => {
    render(<ProductCard product={product} isFav={false} onToggleFav={jest.fn()} onAddToBasket={jest.fn()} />);
    expect(screen.getByRole("link", { name: /Test product/ })).toHaveAttribute("href", "/products/7");
    expect(screen.getByText("£12.99")).toBeInTheDocument();
  });

  test("dispatches basket and favourite actions for the displayed product", async () => {
    const user = userEvent.setup();
    const onAddToBasket = jest.fn();
    const onToggleFav = jest.fn();
    render(<ProductCard product={product} isFav={false} onToggleFav={onToggleFav} onAddToBasket={onAddToBasket} />);

    await user.click(screen.getByRole("button", { name: "Add to basket" }));
    await user.click(screen.getByRole("button", { name: "Add to favourites" }));
    expect(onAddToBasket).toHaveBeenCalledWith(7);
    expect(onToggleFav).toHaveBeenCalledWith(7);
  });

  test("announces the removal action for an existing favourite", () => {
    render(<ProductCard product={product} isFav onToggleFav={jest.fn()} onAddToBasket={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Remove from favourites" })).toBeInTheDocument();
  });
});
