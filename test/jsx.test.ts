import { describe, expect, it } from "vitest";

import { component, element } from "../learning/jsx/expression";
import { jsx, render } from "../src";

describe("classic JSX adapter", () => {
  it("passes JSX attributes and multiple children to the renderer", () => {
    const container = document.createElement("div");

    render(element, container);

    expect(container.innerHTML).toBe('<p class="message">Hello, Ada</p>');
  });

  it("keeps a JSX key on the component VNode and handles a tag with no attributes", () => {
    const container = document.createElement("div");

    expect(component).toEqual({
      type: "component",
      key: "user-a",
      component: expect.any(Function),
      props: { name: "Ada", children: [] },
    });

    render(component, container);

    expect(container.innerHTML).toBe("<p>Ada</p>");
  });

  it("normalizes an explicit children prop and omits undefined host attributes", () => {
    const container = document.createElement("div");

    render(jsx("p", { title: undefined, children: ["Ada", 2] }), container);

    expect(container.innerHTML).toBe("<p>Ada2</p>");
  });
});
