import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/FormControls";
import { Card, PageContainer, StatusMessage } from "@/components/ui/Layout";

describe("design-system primitives", () => {
  test("button has safe defaults and handles user interaction", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Add to basket</Button>);

    const button = screen.getByRole("button", { name: "Add to basket" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("bg-primary", "focus-visible:outline-focus");
    await user.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("disabled buttons cannot be activated", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button disabled onClick={onClick}>Unavailable</Button>);

    await user.click(screen.getByRole("button", { name: "Unavailable" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("loading buttons retain their label width and expose progress accessibly", () => {
    render(<Button loading loadingLabel="Adding item">Add to basket</Button>);

    const button = screen.getByRole("button", { name: "Adding item" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Add to basket")).toHaveClass("invisible");
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  test("buttonStyles supports links using the same visual contract", () => {
    expect(buttonStyles({ variant: "secondary", size: "sm" })).toEqual(
      expect.stringContaining("bg-surface")
    );
  });

  test("text and select controls preserve native form behaviour", async () => {
    const user = userEvent.setup();
    render(
      <>
        <label htmlFor="name">Name</label>
        <TextInput id="name" />
        <label htmlFor="delivery">Delivery</label>
        <Select id="delivery" defaultValue="standard">
          <option value="standard">Standard</option>
          <option value="next-day">Next day</option>
        </Select>
      </>
    );

    await user.type(screen.getByRole("textbox", { name: "Name" }), "Morgan");
    await user.selectOptions(screen.getByRole("combobox", { name: "Delivery" }), "next-day");
    expect(screen.getByRole("textbox", { name: "Name" })).toHaveValue("Morgan");
    expect(screen.getByRole("combobox", { name: "Delivery" })).toHaveValue("next-day");
    expect(screen.getByRole("combobox", { name: "Delivery" })).toHaveClass("appearance-none", "pr-11");
    expect(screen.getByRole("combobox", { name: "Delivery" }).parentElement?.querySelector("svg")).toBeInTheDocument();
  });

  test("layout primitives expose semantic theme classes and status attributes", () => {
    render(
      <PageContainer data-testid="page">
        <Card data-testid="card">
          <StatusMessage role="status" tone="success">Saved</StatusMessage>
        </Card>
      </PageContainer>
    );

    expect(screen.getByTestId("page")).toHaveClass("max-w-content");
    expect(screen.getByTestId("card")).toHaveClass("border-border", "bg-surface");
    expect(screen.getByRole("status")).toHaveClass("text-success");
  });
});
