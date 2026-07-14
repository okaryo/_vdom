import { mount } from "./mount";
import type { VNode } from "./vnode";

type RenderedRoot = {
  vnode: VNode;
  node: Node;
};

const renderedRoots = new WeakMap<Node, RenderedRoot>();

export function render(vnode: VNode, container: Node): Node {
  if (renderedRoots.has(container)) {
    throw new Error(
      "Updating an existing render root is not supported until reconciliation is implemented.",
    );
  }

  const node = mount(vnode, container);

  renderedRoots.set(container, { vnode, node });

  return node;
}
