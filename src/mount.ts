import { applyInitialElementProps } from "./props";
import { createComponentInstance } from "./component-instance";
import type { VNode } from "./vnode";

export function mount(vnode: VNode, container: Node): Node {
  if (vnode.type === "text") {
    const node = document.createTextNode(vnode.value);

    container.appendChild(node);

    return node;
  }

  if (vnode.type === "component") {
    const output = vnode.component(vnode.props);

    createComponentInstance(vnode, output);

    return mount(output, container);
  }

  const element = document.createElement(vnode.tagName);
  applyInitialElementProps(vnode.props, element);

  for (const child of vnode.children) {
    mount(child, element);
  }

  container.appendChild(element);

  return element;
}
