import type { VNode } from "./vnode";

export function mount(vnode: VNode, container: Node): Node {
  const node =
    vnode.type === "element"
      ? document.createElement(vnode.tagName)
      : document.createTextNode(vnode.value);

  container.appendChild(node);

  return node;
}
