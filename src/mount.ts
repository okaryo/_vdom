import type { ElementVNode } from "./vnode";

export function mount(vnode: ElementVNode, container: Node): Element {
  const element = document.createElement(vnode.tagName);

  container.appendChild(element);

  return element;
}
