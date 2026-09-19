import { describe, expect, it } from "vitest";

import {
  getCurrentComponentInstance,
  readStateValue,
  type ComponentInstance,
} from "../src/component-instance";
import { h, render, type FunctionComponent } from "../src";

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
      const count = readStateValue(initialCount);

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
});
