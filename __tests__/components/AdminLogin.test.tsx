import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminLogin from "@/app/admin/orders/AdminLogin";

jest.mock("@/app/actions/orders", () => ({
  loginAdmin: jest.fn(async () => ({})),
}));

describe("AdminLogin", () => {
  test("exposes the demo password rules through native validation", () => {
    render(<AdminLogin />);
    const password = screen.getByLabelText("Admin password");
    expect(password).toHaveAttribute("type", "password");
    expect(password).toBeRequired();
    expect(password).toHaveAttribute("minlength", "8");
    expect(password).toHaveAttribute("maxlength", "128");
    expect(screen.getByText("password", { selector: "strong" })).toBeInTheDocument();
  });

  test("lets a user reveal and hide the password", async () => {
    const user = userEvent.setup();
    render(<AdminLogin />);
    const password = screen.getByLabelText("Admin password");

    await user.click(screen.getByRole("button", { name: "Show" }));
    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Hide" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Hide" }));
    expect(password).toHaveAttribute("type", "password");
  });
});
