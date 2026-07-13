import { afterEach, describe, expect, it, vi } from "vitest";

import { h, type TextVNode } from "../src";

describe("h", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates an element Virtual Node without touching the DOM", () => {
    const child: TextVNode = {
      type: "text",
      value: "Virtual DOM",
    };
    const props = { id: "introduction" };
    const children = [child];
    const createElement = vi.spyOn(document, "createElement");

    const vnode = h("section", props, children);

    expect(vnode).toEqual({
      type: "element",
      tagName: "section",
      props,
      children,
    });
    expect(createElement).not.toHaveBeenCalled();
  });
});
