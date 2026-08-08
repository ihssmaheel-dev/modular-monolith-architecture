import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function App() {
  return <div data-testid="app">Hello World</div>;
}

describe("App", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByTestId("app")).toBeInTheDocument();
  });

  it("displays correct text", () => {
    render(<App />);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });
});
