import { describe, expect, it } from "vitest";

describe("test environment", () => {
  it("provides the browser DOM", () => {
    const element = document.createElement("div");

    element.textContent = "Virtual DOM";

    expect(element.outerHTML).toBe("<div>Virtual DOM</div>");
  });
});
