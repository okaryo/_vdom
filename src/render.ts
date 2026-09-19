import type { RenderContext } from "./component-instance";
import { mount } from "./mount";
import { reconcile } from "./reconcile";
import type { VNode } from "./vnode";

type RenderedRoot = {
  vnode: VNode;
  node: Node;
  context: RenderContext;
};

const renderedRoots = new WeakMap<Node, RenderedRoot>();

export function render(vnode: VNode, container: Node): Node {
  const renderedRoot = renderedRoots.get(container);

  if (renderedRoot !== undefined) {
    const node = reconcile(
      renderedRoot.vnode,
      vnode,
      renderedRoot.node,
      renderedRoot.context,
    );

    renderedRoots.set(container, {
      vnode,
      node,
      context: renderedRoot.context,
    });

    return node;
  }

  const context: RenderContext = {
    requestRender() {
      const currentRoot = renderedRoots.get(container);

      if (currentRoot === undefined) {
        throw new Error(
          "Cannot update component state before its root is retained.",
        );
      }

      render(currentRoot.vnode, container);
    },
  };
  const node = mount(vnode, container, context);

  renderedRoots.set(container, { vnode, node, context });

  return node;
}
