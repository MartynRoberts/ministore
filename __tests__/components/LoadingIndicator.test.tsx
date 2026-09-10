import { render, screen } from "@testing-library/react";
import { LoadingIndicator, PageLoading } from "@/components/ui/LoadingIndicator";

describe("LoadingIndicator", () => {
  test("reserves space and exposes status text only while active", () => {
    const { container, rerender } = render(<LoadingIndicator active={false} label="Updating basket" />);
    const indicator = container.firstElementChild;

    expect(indicator).toHaveClass("h-5", "w-5");
    expect(screen.queryByText("Updating basket")).not.toBeInTheDocument();

    rerender(<LoadingIndicator active label="Updating basket" />);
    expect(screen.getByText("Updating basket")).toHaveClass("sr-only");
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("page loading states provide a visible, accessible label", () => {
    render(<PageLoading label="Loading products" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading products");
    expect(screen.getByRole("status").querySelector("svg")).toBeInTheDocument();
  });
});
