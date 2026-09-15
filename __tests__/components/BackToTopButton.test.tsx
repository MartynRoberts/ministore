import { fireEvent, render, screen } from "@testing-library/react";
import BackToTopButton from "@/components/BackToTopButton";

describe("BackToTopButton", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
    window.scrollTo = jest.fn();
    window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  });

  test("appears after scrolling and smoothly returns to the top", () => {
    render(<BackToTopButton />);

    expect(screen.queryByRole("button", { name: "Back to top" })).not.toBeInTheDocument();

    Object.defineProperty(window, "scrollY", { configurable: true, value: 401 });
    fireEvent.scroll(window);

    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  test("avoids smooth scrolling when reduced motion is preferred", () => {
    Object.defineProperty(window, "scrollY", { configurable: true, value: 401 });
    window.matchMedia = jest.fn().mockReturnValue({ matches: true });

    render(<BackToTopButton />);
    fireEvent.click(screen.getByRole("button", { name: "Back to top" }));

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
