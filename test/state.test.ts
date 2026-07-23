import { describe, expect, it } from "vitest";

import { createState, h, render, type FunctionComponent } from "../src";

describe("createState", () => {
  it("stores a value and replaces it explicitly", () => {
    const count = createState(0);

    expect(count.get()).toBe(0);

    count.set(1);

    expect(count.get()).toBe(1);
  });

  it("notifies subscribers synchronously after storing the new value", () => {
    const count = createState(0);
    const observedValues: number[] = [];
    const unsubscribe = count.subscribe(() => {
      observedValues.push(count.get());
    });

    count.set(1);

    expect(observedValues).toEqual([1]);

    unsubscribe();
    count.set(2);

    expect(count.get()).toBe(2);
    expect(observedValues).toEqual([1]);
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

  it("synchronously rerenders when the application subscribes render", () => {
    type CounterProps = {
      count: number;
    };
    const Counter: FunctionComponent<CounterProps> = ({ count }) =>
      h("p", {}, [`Count: ${count}`]);
    const count = createState(0);
    const container = document.createElement("div");
    const rerender = () =>
      render(h(Counter, { count: count.get() }, []), container);
    const firstNode = rerender();
    const firstText = firstNode.firstChild;
    const unsubscribe = count.subscribe(rerender);

    count.set(1);

    expect(container.textContent).toBe("Count: 1");
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.firstChild).toBe(firstText);

    unsubscribe();
  });
});
