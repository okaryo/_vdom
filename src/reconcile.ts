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

function areCompatible(oldVNode: VNode, newVNode: VNode): boolean {
  if (oldVNode.type === "text" && newVNode.type === "text") {
    return true;
  }

  if (oldVNode.type === "element" && newVNode.type === "element") {
    return oldVNode.tagName === newVNode.tagName;
  }

  return false;
}

function replaceVNode(newVNode: VNode, node: Node): Node {
  const parent = node.parentNode;

  if (parent === null) {
    throw new Error("Cannot replace a DOM node without a parent.");
  }

  const fragment = document.createDocumentFragment();
  const newNode = mount(newVNode, fragment);

  parent.replaceChild(newNode, node);

  return newNode;
}

export function reconcile(oldVNode: VNode, newVNode: VNode, node: Node): Node {
  if (!areCompatible(oldVNode, newVNode)) {
    return replaceVNode(newVNode, node);
  }

  if (oldVNode.type === "text" || newVNode.type === "text") {
    throw new Error(
      "Updating a compatible text node is not supported by this reconciliation step.",
    );
  }

  if (!(node instanceof Element)) {
    throw new Error(
      "The retained root DOM does not match the old element VNode.",
    );
  }

  if (!haveSameProps(oldVNode.props, newVNode.props)) {
    throw new Error(
      "Updating element props is not supported by this reconciliation step.",
    );
  }

  if (oldVNode.children.length === 0 && newVNode.children.length === 1) {
    if (node.childNodes.length !== 0) {
      throw new Error(
        "The retained root DOM does not match the old VNode child count.",
      );
    }

    mount(newVNode.children[0], node);

    return node;
  }

  if (oldVNode.children.length === 1 && newVNode.children.length === 0) {
    const childNode = node.firstChild;

    if (childNode === null || node.childNodes.length !== 1) {
      throw new Error(
        "The retained root DOM does not match the old VNode child count.",
      );
    }

    node.removeChild(childNode);

    return node;
  }

  throw new Error(
    "This reconciliation step only supports adding or removing the only child of an element.",
  );
}
