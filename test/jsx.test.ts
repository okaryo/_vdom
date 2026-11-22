import { describe, expect, it } from "vitest";

import { component, element } from "../learning/jsx/expression";
import { render } from "../src";

describe("classic JSX adapter", () => {
  it("passes JSX attributes and multiple children to the renderer", () => {
    const container = document.createElement("div");

    render(element, container);

    expect(container.innerHTML).toBe('<p class="message">Hello, Ada</p>');
  });

  it("keeps a JSX key on the component VNode and handles a tag with no attributes", () => {
    const container = document.createElement("div");

    expect(component.key).toBe("user-a");
    expect(component.props).toEqual({ name: "Ada", children: [] });

    render(component, container);

    expect(container.innerHTML).toBe("<p>Ada</p>");
  });
});
