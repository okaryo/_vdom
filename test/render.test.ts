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

  it("retains the root and rejects an update before reconciliation exists", () => {
    const firstVNode = h("ul", {}, []);
    const nextVNode = h("ul", {}, [h("li", {}, ["new child"])]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    expect(() => render(nextVNode, container)).toThrow(
      "Updating an existing render root is not supported until reconciliation is implemented.",
    );
    expect(container.innerHTML).toBe("<ul></ul>");
    expect(container.firstChild).toBe(firstNode);
  });
});
