import { describe, expect, it } from "vitest";

import { mountCounter } from "../examples/counter";

describe("counter example", () => {
  it("increments through component-owned state while reusing its DOM", () => {
    const container = document.createElement("div");
    const button = mountCounter(container);
    const text = button.firstChild;

    expect(container.innerHTML).toBe("<button>Count: 0</button>");

    button.dispatchEvent(new MouseEvent("click"));

    expect(container.innerHTML).toBe("<button>Count: 1</button>");
    expect(container.firstChild).toBe(button);
    expect(button.firstChild).toBe(text);

    button.dispatchEvent(new MouseEvent("click"));

    expect(container.innerHTML).toBe("<button>Count: 2</button>");
    expect(container.firstChild).toBe(button);
    expect(button.firstChild).toBe(text);
  });
});
