import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HeaderNav from "@/app/HeaderNav";

jest.mock("@/app/ShopProvider", () => ({
  useShop: () => ({ basket: { count: 3 } }),
}));

describe("HeaderNav", () => {
  test("keeps the basket visible and opens mobile navigation from the burger", async () => {
    const user = userEvent.setup();
    render(<HeaderNav />);

    expect(screen.getByRole("link", { name: "Basket (3)" })).toHaveAttribute("href", "/basket");
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("button", { name: "Close menu" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Shop" })).toBeInTheDocument();
  });

  test("drills from Shop into a department and back through each level", async () => {
    const user = userEvent.setup();
    render(<HeaderNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(screen.getByRole("button", { name: "Shop" }));

    expect(screen.getByRole("heading", { name: "Shop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Technology/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Back to menu" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Technology/ }));
    expect(screen.getByRole("heading", { name: "Technology" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Smartphones" })).toHaveAttribute("href", "/products?category=smartphones");

    await user.click(screen.getByRole("button", { name: "Back to departments" }));
    expect(screen.getByRole("heading", { name: "Shop" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Back to menu" }));
    expect(screen.getByRole("button", { name: "Shop" })).toBeInTheDocument();
  });

  test("Escape closes the mobile menu and restores burger focus", async () => {
    const user = userEvent.setup();
    render(<HeaderNav />);
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.keyboard("{Escape}");

    expect(screen.getByRole("button", { name: "Open menu" })).toHaveFocus();
    expect(screen.queryByRole("button", { name: "Shop" })).not.toBeInTheDocument();
  });
});
