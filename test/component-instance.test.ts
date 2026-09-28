import { describe, expect, it } from "vitest";

import {
  getCurrentComponentInstance,
  type ComponentInstance,
} from "../src/component-instance";
import {
  h,
  render,
  useState,
  type ComponentStateSetter,
  type FunctionComponent,
} from "../src";

describe("component evaluation context", () => {
  it("exposes the retained instance only while its component is evaluated", () => {
    const observedInstances: ComponentInstance[] = [];
    const Message: FunctionComponent = () => {
      observedInstances.push(getCurrentComponentInstance());

      return h("p", {}, ["Hello"]);
    };
    const container = document.createElement("div");

    expect(() => getCurrentComponentInstance()).toThrow(
      "A component instance is only available during component evaluation.",
    );

    render(h(Message, {}, []), container);
    render(h(Message, {}, []), container);

    expect(observedInstances).toHaveLength(2);
    expect(observedInstances[1]).toBe(observedInstances[0]);
    expect(() => getCurrentComponentInstance()).toThrow(
      "A component instance is only available during component evaluation.",
    );
  });

  it("reads the first state value stored on a retained instance", () => {
    let initialCount = 0;
    const Counter: FunctionComponent = () => {
      const [count] = useState(initialCount);

      return h("p", {}, [`Count: ${count}`]);
    };
    const container = document.createElement("div");
    const firstNode = render(h(Counter, {}, []), container);
    const firstText = firstNode.firstChild;

    initialCount = 1;
    const nextNode = render(h(Counter, {}, []), container);

    expect(container.textContent).toBe("Count: 0");
    expect(nextNode).toBe(firstNode);
    expect(nextNode.firstChild).toBe(firstText);
  });

  it("synchronously rerenders the root after updating stored state", () => {
    const observedSetters: ComponentStateSetter<number>[] = [];
    const Counter: FunctionComponent = () => {
      const [count, setCount] = useState(0);

      observedSetters.push(setCount);

      return h("button", {}, [`Count: ${count}`]);
    };
    const container = document.createElement("div");
    const firstRoot = render(
      h("section", {}, [h(Counter, {}, [])]),
      container,
    );
    const firstButton = firstRoot.firstChild;
    const firstText = firstButton?.firstChild;
    const firstSetter = observedSetters[0];

    firstSetter(1);

    expect(container.innerHTML).toBe(
      "<section><button>Count: 1</button></section>",
    );
    expect(container.firstChild).toBe(firstRoot);
    expect(firstRoot.firstChild).toBe(firstButton);
    expect(firstButton?.firstChild).toBe(firstText);
    expect(observedSetters[1]).toBe(firstSetter);

    const nextRoot = render(
      h("section", {}, [h(Counter, {}, [])]),
      container,
    );

    expect(container.textContent).toBe("Count: 1");
    expect(nextRoot).toBe(firstRoot);
    expect(nextRoot.firstChild).toBe(firstButton);
    expect(observedSetters[2]).toBe(firstSetter);
  });

  it("rerenders synchronously for every consecutive state update", () => {
    const observedCounts: number[] = [];
    const observedSetters: ComponentStateSetter<number>[] = [];
    const Counter: FunctionComponent = () => {
      const [count, setCount] = useState(0);

      observedCounts.push(count);
      observedSetters.push(setCount);

      return h("p", {}, [`Count: ${count}`]);
    };
    const container = document.createElement("div");
    const firstNode = render(h(Counter, {}, []), container);
    const firstText = firstNode.firstChild;
    const setCount = observedSetters[0];

    setCount(1);

    expect(observedCounts).toEqual([0, 1]);
    expect(container.textContent).toBe("Count: 1");

    setCount(2);

    expect(observedCounts).toEqual([0, 1, 2]);
    expect(container.textContent).toBe("Count: 2");
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.firstChild).toBe(firstText);
  });

  it("initializes fresh state when the component function changes", () => {
    const firstSetters: ComponentStateSetter<number>[] = [];
    const FirstCounter: FunctionComponent = () => {
      const [count, setCount] = useState(0);

      firstSetters.push(setCount);

      return h("p", {}, [`First: ${count}`]);
    };
    const SecondCounter: FunctionComponent = () => {
      const [count] = useState(10);

      return h("p", {}, [`Second: ${count}`]);
    };
    const container = document.createElement("div");
    const firstNode = render(h(FirstCounter, {}, []), container);

    firstSetters[0](1);

    expect(container.textContent).toBe("First: 1");

    const secondNode = render(h(SecondCounter, {}, []), container);

    expect(container.textContent).toBe("Second: 10");
    expect(secondNode).not.toBe(firstNode);
  });
});
