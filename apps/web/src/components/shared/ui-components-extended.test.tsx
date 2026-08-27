import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  Alert,
  AlertTitle,
  AlertDescription,
  Progress,
  Switch,
  Slider,
  RadioGroup,
  RadioGroupItem,
  Toggle,
  Textarea,
  ScrollArea,
  AspectRatio,
} from "@repo/ui";

describe("Extended UI Components", () => {
  it("renders Alert with title, description, and variant", () => {
    render(
      <Alert variant="destructive">
        <AlertTitle>Critical Error</AlertTitle>
        <AlertDescription>Operation failed unexpectedly.</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Critical Error")).toBeInTheDocument();
    expect(screen.getByText("Operation failed unexpectedly.")).toBeInTheDocument();
  });

  it("renders Progress bar with value", () => {
    const { container } = render(<Progress value={65} />);
    expect(container.querySelector('[role="progressbar"]')).toBeInTheDocument();
  });

  it("renders Switch and toggles checked state", () => {
    render(<Switch aria-label="Toggle notifications" />);
    const switchEl = screen.getByRole("switch", { name: "Toggle notifications" });
    expect(switchEl).toBeInTheDocument();
    expect(switchEl).toHaveAttribute("data-state", "unchecked");
    fireEvent.click(switchEl);
    expect(switchEl).toHaveAttribute("data-state", "checked");
  });

  it("renders Slider", () => {
    const { container } = render(<Slider defaultValue={[50]} max={100} step={1} />);
    expect(container.querySelector('[role="slider"]')).toBeInTheDocument();
  });

  it("renders RadioGroup and items", () => {
    render(
      <RadioGroup defaultValue="option-1">
        <RadioGroupItem value="option-1" id="r1" aria-label="Option 1" />
        <RadioGroupItem value="option-2" id="r2" aria-label="Option 2" />
      </RadioGroup>,
    );
    const radio1 = screen.getByRole("radio", { name: "Option 1" });
    const radio2 = screen.getByRole("radio", { name: "Option 2" });
    expect(radio1).toBeChecked();
    expect(radio2).not.toBeChecked();
  });

  it("renders Toggle button and toggles state", () => {
    render(<Toggle aria-label="Toggle bold">B</Toggle>);
    const toggle = screen.getByRole("button", { name: "Toggle bold" });
    expect(toggle).toHaveAttribute("data-state", "off");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("data-state", "on");
  });

  it("renders Textarea with placeholder and value", () => {
    render(<Textarea placeholder="Enter your comments here" defaultValue="Hello" />);
    const textarea = screen.getByPlaceholderText("Enter your comments here");
    expect(textarea).toHaveValue("Hello");
  });

  it("renders ScrollArea with viewport", () => {
    render(
      <ScrollArea className="h-48 w-48">
        <div>Scrollable content here</div>
      </ScrollArea>,
    );
    expect(screen.getByText("Scrollable content here")).toBeInTheDocument();
  });

  it("renders AspectRatio container", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <img src="/img.jpg" alt="test" />
      </AspectRatio>,
    );
    expect(container.querySelector("img")).toBeInTheDocument();
  });
});
