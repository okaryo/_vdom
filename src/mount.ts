import { applyInitialElementProps } from "./props";
import {
  createComponentInstance,
  detachedRenderContext,
  evaluateComponent,
  type RenderContext,
} from "./component-instance";
import type { VNode } from "./vnode";

export function mount(
  vnode: VNode,
  container: Node,
  context: RenderContext = detachedRenderContext,
): Node {
  if (vnode.type === "text") {
    const node = document.createTextNode(vnode.value);

    container.appendChild(node);

    return node;
  }

  if (vnode.type === "component") {
    const instance = createComponentInstance(vnode, context);
    const output = evaluateComponent(instance, vnode);

    instance.output = output;

    return mount(output, container, context);
  }

  const element = document.createElement(vnode.tagName);
  applyInitialElementProps(vnode.props, element);

  for (const child of vnode.children) {
    mount(child, element, context);
  }

  container.appendChild(element);

  return element;
}
