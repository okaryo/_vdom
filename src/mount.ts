import { applyInitialElementProps } from "./props";
import type { VNode } from "./vnode";

export function mount(vnode: VNode, container: Node): Node {
  if (vnode.type === "text") {
    const node = document.createTextNode(vnode.value);

    container.appendChild(node);

    return node;
  }

  const element = document.createElement(vnode.tagName);
  applyInitialElementProps(vnode.props, element);

  for (const child of vnode.children) {
    mount(child, element);
  }

  container.appendChild(element);

  return element;
}
