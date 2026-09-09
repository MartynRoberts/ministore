import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProductNav, { productDepartments } from "@/app/ProductNav";

describe("ProductNav", () => {
  test("opens a complete department menu from the Shop control", async () => {
    const user = userEvent.setup();
    render(<ProductNav />);
    const shop = screen.getByRole("button", { name: "Shop" });

    expect(shop).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("heading", { name: "Browse by department" })).not.toBeInTheDocument();
    await user.click(shop);

    expect(shop).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("heading", { name: "Browse by department" })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(
      productDepartments.reduce((total, department) => total + department.categories.length, 1)
    );
  });

  test("category links use the catalogue query contract and close the menu", async () => {
    const user = userEvent.setup();
    render(<ProductNav />);
    await user.click(screen.getByRole("button", { name: "Shop" }));

    const laptops = screen.getByRole("link", { name: "Laptops" });
    expect(laptops).toHaveAttribute("href", "/products?category=laptops");
    await user.click(laptops);
    expect(screen.getByRole("button", { name: "Shop" })).toHaveAttribute("aria-expanded", "false");
  });

  test("Escape closes the menu and returns focus to Shop", async () => {
    const user = userEvent.setup();
    render(<ProductNav />);
    const shop = screen.getByRole("button", { name: "Shop" });
    await user.click(shop);
    await user.keyboard("{Escape}");

    expect(shop).toHaveAttribute("aria-expanded", "false");
    expect(shop).toHaveFocus();
  });
});
