import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Pagination from "@/components/Pagination";

describe("Pagination", () => {
  test("renders nothing for a single page", () => {
    const { container } = render(<Pagination page={1} totalPages={1} updateParam={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  test("marks the current page and disables invalid navigation", () => {
    render(<Pagination page={1} totalPages={10} updateParam={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Page 1" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  test("requests the next and selected pages through the URL callback", async () => {
    const user = userEvent.setup();
    const updateParam = jest.fn();
    render(<Pagination page={2} totalPages={5} updateParam={updateParam} />);

    await user.click(screen.getByRole("button", { name: "Next page" }));
    await user.click(screen.getByRole("button", { name: "Page 5" }));
    expect(updateParam).toHaveBeenNthCalledWith(1, "page", "3");
    expect(updateParam).toHaveBeenNthCalledWith(2, "page", "5");
  });
});
