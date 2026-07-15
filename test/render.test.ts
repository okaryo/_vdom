import { describe, expect, it } from "vitest";

import { h, render } from "../src";

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
});
