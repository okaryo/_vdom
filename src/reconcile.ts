import { mount } from "./mount";
import type { ElementProps, VNode } from "./vnode";

function haveSameProps(oldProps: ElementProps, newProps: ElementProps): boolean {
  const oldNames = Object.keys(oldProps);
  const newNames = Object.keys(newProps);

  return (
    oldNames.length === newNames.length &&
    oldNames.every(
      (name) =>
        Object.hasOwn(newProps, name) && oldProps[name] === newProps[name],
    )
  );
}

export function reconcile(oldVNode: VNode, newVNode: VNode, node: Node): Node {
  if (
    oldVNode.type !== "element" ||
    newVNode.type !== "element" ||
    oldVNode.tagName !== newVNode.tagName ||
    !(node instanceof Element)
  ) {
    throw new Error(
      "This reconciliation step only supports updating the same root element type.",
    );
  }

  if (!haveSameProps(oldVNode.props, newVNode.props)) {
    throw new Error(
      "Updating element props is not supported by this reconciliation step.",
    );
  }

  if (oldVNode.children.length !== 0 || newVNode.children.length !== 1) {
    throw new Error(
      "This reconciliation step only supports adding the first child to an empty element.",
    );
  }

  mount(newVNode.children[0], node);

  return node;
}
