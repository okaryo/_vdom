import type { VNode } from "./vnode";

function eventTypeFromPropName(propName: string): string {
  if (!propName.startsWith("on") || propName.length === 2) {
    throw new TypeError(
      `Event handler prop "${propName}" must start with "on" followed by an event name.`,
    );
  }

  return propName.slice(2).toLowerCase();
}

export function mount(vnode: VNode, container: Node): Node {
  if (vnode.type === "text") {
    const node = document.createTextNode(vnode.value);

    container.appendChild(node);

    return node;
  }

  const element = document.createElement(vnode.tagName);

  for (const [name, value] of Object.entries(vnode.props)) {
    if (typeof value === "function") {
      element.addEventListener(eventTypeFromPropName(name), value);
      continue;
    }

    element.setAttribute(name, value);
  }

  for (const child of vnode.children) {
    mount(child, element);
  }

  container.appendChild(element);

  return element;
}
