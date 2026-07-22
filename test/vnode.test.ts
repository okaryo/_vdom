import { afterEach, describe, expect, it, vi } from "vitest";

import {
  h,
  type ComponentProps,
  type FunctionComponent,
  type TextVNode,
} from "../src";

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

  it("eagerly evaluates a function component into its returned VNode", () => {
    const component: FunctionComponent = vi.fn(() =>
      h("p", { className: "message" }, ["Hello"]),
    );
    const createElement = vi.spyOn(document, "createElement");

    const vnode = h(component, {}, []);

    expect(component).toHaveBeenCalledOnce();
    expect(vnode).toEqual({
      type: "element",
      tagName: "p",
      props: { className: "message" },
      children: [{ type: "text", value: "Hello" }],
    });
    expect(createElement).not.toHaveBeenCalled();
  });

  it("passes component-specific props to a function component", () => {
    type MessageProps = {
      name: string;
      count: number;
    };
    const component: FunctionComponent<MessageProps> = vi.fn(
      ({ name, count }) => h("p", {}, [`${name}: ${count}`]),
    );
    const props = { name: "Ada", count: 2 };

    const vnode = h(component, props, []);

    expect(component).toHaveBeenCalledWith({
      ...props,
      children: [],
    });
    expect(Object.hasOwn(props, "children")).toBe(false);
    expect(vnode).toEqual({
      type: "element",
      tagName: "p",
      props: {},
      children: [{ type: "text", value: "Ada: 2" }],
    });
  });

  it("normalizes children before passing them to a function component", () => {
    type PanelProps = {
      title: string;
    };
    const existingChild = h("strong", {}, ["existing"]);
    const component: FunctionComponent<PanelProps> = vi.fn(
      ({ title, children }) =>
        h("section", {}, [h("h2", {}, [title]), ...children]),
    );

    const vnode = h(
      component,
      { title: "Lesson" },
      ["first", [2, null], false, existingChild],
    );

    expect(component).toHaveBeenCalledWith({
      title: "Lesson",
      children: [
        { type: "text", value: "first" },
        { type: "text", value: "2" },
        existingChild,
      ],
    });
    expect(vnode).toEqual({
      type: "element",
      tagName: "section",
      props: {},
      children: [
        {
          type: "element",
          tagName: "h2",
          props: {},
          children: [{ type: "text", value: "Lesson" }],
        },
        { type: "text", value: "first" },
        { type: "text", value: "2" },
        existingChild,
      ],
    });
  });

  it("rejects ambiguous function component prop shapes", () => {
    const component: FunctionComponent<ComponentProps> = ({ children }) =>
      h("div", {}, children);

    expect(() =>
      h(component, ["item"] as unknown as ComponentProps, []),
    ).toThrow(
      "Function component props must be a property object, not an array.",
    );
    expect(() => h(component, { children: [] }, [])).toThrow(
      'Pass function component children as the third h argument, not as a "children" prop.',
    );
  });
});
