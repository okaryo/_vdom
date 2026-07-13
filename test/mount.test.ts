import { describe, expect, it } from "vitest";

import { mount, type ElementVNode } from "../src";

describe("mount", () => {
  it("creates a real DOM element from an element Virtual Node", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "section",
    };
    const container = document.createElement("div");

    const element = mount(vnode, container);

    expect(container.innerHTML).toBe("<section></section>");
    expect(element.tagName).toBe("SECTION");
    expect(container.firstChild).toBe(element);
  });
});
