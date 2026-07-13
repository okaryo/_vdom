import type { VNode } from "./vnode";

export function mount(vnode: VNode, container: Node): Node {
  if (vnode.type === "text") {
    const node = document.createTextNode(vnode.value);

    container.appendChild(node);

    return node;
  }

  const element = document.createElement(vnode.tagName);

  for (const child of vnode.children) {
    mount(child, element);
  }

  container.appendChild(element);

  return element;
}
