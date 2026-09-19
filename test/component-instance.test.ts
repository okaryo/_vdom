import { describe, expect, it } from "vitest";

import {
  getCurrentComponentInstance,
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
});
