import { describe, expect, it } from "vitest";

import { createState, h, render, type FunctionComponent } from "../src";

describe("createState", () => {
  it("stores a value and replaces it explicitly", () => {
    const count = createState(0);

    expect(count.get()).toBe(0);

    count.set(1);

    expect(count.get()).toBe(1);
  });

  it("does not update rendered output until the application renders again", () => {
    type CounterProps = {
      count: number;
    };
    const Counter: FunctionComponent<CounterProps> = ({ count }) =>
      h("p", {}, [`Count: ${count}`]);
    const count = createState(0);
    const container = document.createElement("div");
    const firstNode = render(
      h(Counter, { count: count.get() }, []),
      container,
    );
    const firstText = firstNode.firstChild;

    count.set(1);

    expect(container.textContent).toBe("Count: 0");

    const nextNode = render(
      h(Counter, { count: count.get() }, []),
      container,
    );

    expect(container.textContent).toBe("Count: 1");
    expect(nextNode).toBe(firstNode);
    expect(nextNode.firstChild).toBe(firstText);
  });
});
