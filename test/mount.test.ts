import { describe, expect, it } from "vitest";

import { mount, type ElementVNode, type TextVNode } from "../src";

describe("mount", () => {
  it("creates a real DOM element from an element Virtual Node", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "section",
      props: {},
      children: [],
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

  it("applies string props as HTML attributes", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "section",
      props: {
        id: "introduction",
        class: "lesson",
        "data-topic": "virtual-dom",
      },
      children: [],
    };
    const container = document.createElement("div");

    mount(vnode, container);

    const element = container.firstElementChild;
    expect(element?.getAttribute("id")).toBe("introduction");
    expect(element?.getAttribute("class")).toBe("lesson");
    expect(element?.getAttribute("data-topic")).toBe("virtual-dom");
  });

  it("recursively mounts element and text children", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "article",
      props: {},
      children: [
        {
          type: "element",
          tagName: "h1",
          props: {},
          children: [
            {
              type: "text",
              value: "Virtual DOM",
            },
          ],
        },
        {
          type: "text",
          value: " is a tree.",
        },
      ],
    };
    const container = document.createElement("div");

    const node = mount(vnode, container);

    expect(container.innerHTML).toBe(
      "<article><h1>Virtual DOM</h1> is a tree.</article>",
    );
    expect(container.firstChild).toBe(node);
    expect(node.firstChild?.nodeName).toBe("H1");
    expect(node.firstChild?.firstChild?.nodeType).toBe(Node.TEXT_NODE);
  });
});
