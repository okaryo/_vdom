import { describe, expect, it } from "vitest";

import { mount, type ElementVNode, type TextVNode } from "../src";

describe("mount", () => {
  it("creates a real DOM element from an element Virtual Node", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "section",
    };
    const container = document.createElement("div");

    const node = mount(vnode, container);

    expect(container.innerHTML).toBe("<section></section>");
    expect(node.nodeName).toBe("SECTION");
    expect(container.firstChild).toBe(node);
  });

  it("creates a real DOM text node from a text Virtual Node", () => {
    const vnode: TextVNode = {
      type: "text",
      value: "Virtual DOM",
    };
    const container = document.createElement("div");

    const node = mount(vnode, container);

    expect(container.textContent).toBe("Virtual DOM");
    expect(node.nodeType).toBe(Node.TEXT_NODE);
    expect(container.firstChild).toBe(node);
  });
});
