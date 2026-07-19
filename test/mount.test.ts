import { describe, expect, it, vi } from "vitest";

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

  it("attaches function props as event listeners", () => {
    const handleClick = vi.fn();
    const vnode: ElementVNode = {
      type: "element",
      tagName: "button",
      props: {
        onClick: handleClick,
      },
      children: [],
    };
    const container = document.createElement("div");

    mount(vnode, container);

    const button = container.querySelector("button");
    const event = new MouseEvent("click");
    button?.dispatchEvent(event);

    expect(handleClick).toHaveBeenCalledOnce();
    expect(handleClick).toHaveBeenCalledWith(event);
    expect(button?.hasAttribute("onclick")).toBe(false);
  });

  it("rejects boolean props without an explicit DOM property rule", () => {
    const vnode: ElementVNode = {
      type: "element",
      tagName: "div",
      props: {
        hidden: true,
      },
      children: [],
    };
    const container = document.createElement("div");

    expect(() => mount(vnode, container)).toThrow(
      'Boolean prop "hidden" is not supported on div.',
    );
    expect(container.childNodes).toHaveLength(0);
  });

  it("rejects a function prop without an on<Event> name", () => {
    const invalidHandler = vi.fn<(event: Event) => void>();
    const vnode: ElementVNode = {
      type: "element",
      tagName: "button",
      props: {
        click: invalidHandler,
      },
      children: [],
    };
    const container = document.createElement("div");

    expect(() => mount(vnode, container)).toThrow(
      'Event handler prop "click" must start with "on" followed by an event name.',
    );
    expect(container.childNodes).toHaveLength(0);
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
