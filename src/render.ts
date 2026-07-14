import { mount } from "./mount";
import { reconcile } from "./reconcile";
import type { VNode } from "./vnode";

type RenderedRoot = {
  vnode: VNode;
  node: Node;
};

const renderedRoots = new WeakMap<Node, RenderedRoot>();

export function render(vnode: VNode, container: Node): Node {
  const renderedRoot = renderedRoots.get(container);

  if (renderedRoot !== undefined) {
    const node = reconcile(renderedRoot.vnode, vnode, renderedRoot.node);

    renderedRoots.set(container, { vnode, node });

    return node;
  }

  const node = mount(vnode, container);

  renderedRoots.set(container, { vnode, node });

  return node;
}
