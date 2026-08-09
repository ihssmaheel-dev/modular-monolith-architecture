import { describe, it, expect } from "vitest";

function App() {
  return { type: "div", props: { "data-testid": "app", children: "Hello World" } };
}

describe("App", () => {
  it("renders without crashing", () => {
    const element = App();
    expect(element.type).toBe("div");
    expect(element.props["data-testid"]).toBe("app");
  });

  it("displays correct text", () => {
    const element = App();
    expect(element.props.children).toBe("Hello World");
  });
});
