import { describe, expect, it } from "vitest";

import { h, render, type TextVNode } from "../src";

describe("render", () => {
  it("mounts and returns the first root DOM node for a container", () => {
    const vnode = h("section", { id: "introduction" }, ["Virtual DOM"]);
    const container = document.createElement("div");

    const node = render(vnode, container);

    expect(container.innerHTML).toBe(
      '<section id="introduction">Virtual DOM</section>',
    );
    expect(container.firstChild).toBe(node);
  });

  it("adds the first child while preserving the root DOM node", () => {
    const firstVNode = h("ul", {}, []);
    const nextVNode = h("ul", {}, [h("li", {}, ["new child"])]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<ul><li>new child</li></ul>");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.firstChild?.nodeName).toBe("LI");
  });

  it("removes the only child while preserving the root DOM node", () => {
    const firstVNode = h("ul", {}, [h("li", {}, ["old child"])]);
    const nextVNode = h("ul", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const childNode = firstNode.firstChild;

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<ul></ul>");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(childNode?.parentNode).toBeNull();
  });

  it("replaces the root when the VNode kind changes", () => {
    const firstVNode: TextVNode = {
      type: "text",
      value: "Loading",
    };
    const nextVNode = h("section", {}, ["Loaded"]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<section>Loaded</section>");
    expect(nextNode).not.toBe(firstNode);
    expect(container.firstChild).toBe(nextNode);
    expect(firstNode.parentNode).toBeNull();
  });

  it("replaces an element when its tag name changes", () => {
    const firstVNode = h("p", {}, ["content"]);
    const nextVNode = h("section", {}, ["content"]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<section>content</section>");
    expect(nextNode).not.toBe(firstNode);
    expect(container.firstChild).toBe(nextNode);
    expect(firstNode.parentNode).toBeNull();
  });

  it("updates a compatible text node while preserving its identity", () => {
    const firstVNode: TextVNode = {
      type: "text",
      value: "Loading",
    };
    const nextVNode: TextVNode = {
      type: "text",
      value: "Loaded",
    };
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.textContent).toBe("Loaded");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.nodeValue).toBe("Loaded");
  });

  it("reuses a compatible empty element without changing the DOM", () => {
    const firstVNode = h("section", { id: "introduction" }, []);
    const nextVNode = h("section", { id: "introduction" }, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe(
      '<section id="introduction"></section>',
    );
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
  });

  it("recursively reconciles nested children by position", () => {
    const firstVNode = h("ul", {}, [
      h("li", { "data-id": "first" }, ["First"]),
      h("li", { "data-id": "second" }, ["Second"]),
    ]);
    const nextVNode = h("ul", {}, [
      h("li", { "data-id": "first" }, ["First updated"]),
      h("li", { "data-id": "second" }, ["Second"]),
      h("li", { "data-id": "third" }, ["Third"]),
    ]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const firstItem = firstNode.childNodes.item(0);
    const firstText = firstItem?.firstChild;
    const secondItem = firstNode.childNodes.item(1);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe(
      '<ul><li data-id="first">First updated</li><li data-id="second">Second</li><li data-id="third">Third</li></ul>',
    );
    expect(nextNode).toBe(firstNode);
    expect(nextNode.childNodes.item(0)).toBe(firstItem);
    expect(firstItem?.firstChild).toBe(firstText);
    expect(nextNode.childNodes.item(1)).toBe(secondItem);
    expect(nextNode.childNodes.item(2).textContent).toBe("Third");
  });

  it("matches children by position instead of moving a later node", () => {
    const firstVNode = h("div", {}, [
      h("p", {}, ["remove"]),
      h("button", {}, ["keep"]),
    ]);
    const nextVNode = h("div", {}, [h("button", {}, ["keep"])]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const oldButton = firstNode.childNodes.item(1);

    const nextNode = render(nextVNode, container);
    const nextButton = nextNode.firstChild;

    expect(container.innerHTML).toBe("<div><button>keep</button></div>");
    expect(nextNode).toBe(firstNode);
    expect(nextButton).not.toBe(oldButton);
    expect(oldButton.parentNode).toBeNull();
  });
});
