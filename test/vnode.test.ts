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

  it("normalizes string and number children into text Virtual Nodes", () => {
    const child: TextVNode = {
      type: "text",
      value: "existing",
    };

    const vnode = h("p", {}, ["count: ", 2, child]);

    expect(vnode.children).toEqual([
      { type: "text", value: "count: " },
      { type: "text", value: "2" },
      child,
    ]);
    expect(vnode.children[2]).toBe(child);
  });

  it("omits null, undefined, and boolean children", () => {
    const vnode = h("div", {}, [null, undefined, false, true]);

    expect(vnode.children).toEqual([]);
  });

  it("recursively flattens nested child arrays in order", () => {
    const child: TextVNode = {
      type: "text",
      value: "existing",
    };

    const vnode = h("p", {}, [["first", [2, null]], false, [child]]);

    expect(vnode.children).toEqual([
      { type: "text", value: "first" },
      { type: "text", value: "2" },
      child,
    ]);
    expect(vnode.children[2]).toBe(child);
  });
});
