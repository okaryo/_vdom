import { mount } from "./mount";
import { updateElementProps } from "./props";
import type { VNode } from "./vnode";

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

function reconcileChildrenByPosition(
  oldChildren: VNode[],
  newChildren: VNode[],
  element: Element,
): void {
  if (element.childNodes.length !== oldChildren.length) {
    throw new Error(
      "The retained element DOM does not match the old VNode child count.",
    );
  }

  const commonLength = Math.min(oldChildren.length, newChildren.length);

  for (let index = 0; index < commonLength; index += 1) {
    const childNode = element.childNodes.item(index);

    if (childNode === null) {
      throw new Error(`Missing DOM child at position ${index}.`);
    }

    reconcile(oldChildren[index], newChildren[index], childNode);
  }

  for (let index = commonLength; index < newChildren.length; index += 1) {
    mount(newChildren[index], element);
  }

  while (element.childNodes.length > newChildren.length) {
    const childNode = element.lastChild;

    if (childNode === null) {
      throw new Error("Cannot remove a missing DOM child.");
    }

    element.removeChild(childNode);
  }
}

export function reconcile(oldVNode: VNode, newVNode: VNode, node: Node): Node {
  if (!areCompatible(oldVNode, newVNode)) {
    return replaceVNode(newVNode, node);
  }

  if (oldVNode.type === "text" && newVNode.type === "text") {
    if (!(node instanceof Text)) {
      throw new Error(
        "The retained root DOM does not match the old text VNode.",
      );
    }

    if (oldVNode.value !== newVNode.value) {
      node.data = newVNode.value;
    }

    return node;
  }

  if (oldVNode.type !== "element" || newVNode.type !== "element") {
    throw new Error(
      "Compatible VNodes must both be text nodes or matching elements.",
    );
  }

  if (!(node instanceof Element)) {
    throw new Error(
      "The retained root DOM does not match the old element VNode.",
    );
  }

  updateElementProps(oldVNode.props, newVNode.props, node);

  reconcileChildrenByPosition(
    oldVNode.children,
    newVNode.children,
    node,
  );

  return node;
}
