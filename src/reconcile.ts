import {
  detachedRenderContext,
  evaluateComponent,
  reuseComponentInstance,
  type RenderContext,
} from "./component-instance";
import { mount } from "./mount";
import { validateKeyedChildren } from "./child-keys";
import { updateElementProps } from "./props";
import type { VNode, VNodeKey } from "./vnode";

function areCompatible(oldVNode: VNode, newVNode: VNode): boolean {
  if (oldVNode.key !== newVNode.key) {
    return false;
  }

  if (oldVNode.type === "text" && newVNode.type === "text") {
    return true;
  }

  if (oldVNode.type === "element" && newVNode.type === "element") {
    return oldVNode.tagName === newVNode.tagName;
  }

  if (
    oldVNode.type === "component" &&
    newVNode.type === "component"
  ) {
    return oldVNode.component === newVNode.component;
  }

  return false;
}

function replaceVNode(
  newVNode: VNode,
  node: Node,
  context: RenderContext,
): Node {
  const parent = node.parentNode;

  if (parent === null) {
    throw new Error("Cannot replace a DOM node without a parent.");
  }

  const fragment = document.createDocumentFragment();
  const newNode = mount(newVNode, fragment, context);

  parent.replaceChild(newNode, node);

  return newNode;
}

function reconcileChildrenByPosition(
  oldChildren: VNode[],
  newChildren: VNode[],
  element: Element,
  context: RenderContext,
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

    reconcile(
      oldChildren[index],
      newChildren[index],
      childNode,
      context,
    );
  }

  for (let index = commonLength; index < newChildren.length; index += 1) {
    mount(newChildren[index], element, context);
  }

  while (element.childNodes.length > newChildren.length) {
    const childNode = element.lastChild;

    if (childNode === null) {
      throw new Error("Cannot remove a missing DOM child.");
    }

    element.removeChild(childNode);
  }
}

function reconcileChildrenByKey(
  oldChildren: VNode[],
  newChildren: VNode[],
  element: Element,
  context: RenderContext,
): void {
  validateKeyedChildren(oldChildren);
  validateKeyedChildren(newChildren);

  if (element.childNodes.length !== oldChildren.length) {
    throw new Error(
      "The retained element DOM does not match the old VNode child count.",
    );
  }

  const oldNodes = Array.from(element.childNodes);
  const oldChildrenByKey = new Map<VNodeKey, { vnode: VNode; node: Node }>();

  oldChildren.forEach((vnode, index) => {
    oldChildrenByKey.set(vnode.key!, { vnode, node: oldNodes[index] });
  });

  newChildren.forEach((vnode, index) => {
    const match = oldChildrenByKey.get(vnode.key!);
    const node = match === undefined
      ? mount(vnode, element, context)
      : reconcile(match.vnode, vnode, match.node, context);

    oldChildrenByKey.delete(vnode.key!);

    const nodeAtPosition = element.childNodes.item(index);

    if (node !== nodeAtPosition) {
      element.insertBefore(node, nodeAtPosition);
    }
  });

  for (const { node } of oldChildrenByKey.values()) {
    element.removeChild(node);
  }
}

export function reconcile(
  oldVNode: VNode,
  newVNode: VNode,
  node: Node,
  context: RenderContext = detachedRenderContext,
): Node {
  if (!areCompatible(oldVNode, newVNode)) {
    return replaceVNode(newVNode, node, context);
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

  if (
    oldVNode.type === "component" &&
    newVNode.type === "component"
  ) {
    const instance = reuseComponentInstance(
      oldVNode,
      newVNode,
      context,
    );
    const oldOutput = instance.output;

    if (oldOutput === null) {
      throw new Error(
        "The reused component instance has no previous output.",
      );
    }

    const newOutput = evaluateComponent(instance, newVNode);
    const newNode = reconcile(oldOutput, newOutput, node, context);

    instance.output = newOutput;

    return newNode;
  }

  if (oldVNode.type !== "element" || newVNode.type !== "element") {
    throw new Error(
      "Compatible VNodes must have matching text, element, or component kinds.",
    );
  }

  if (!(node instanceof Element)) {
    throw new Error(
      "The retained root DOM does not match the old element VNode.",
    );
  }

  updateElementProps(oldVNode.props, newVNode.props, node);

  const hasKeys = [...oldVNode.children, ...newVNode.children].some(
    (child) => child.key !== undefined,
  );
  const reconcileChildren = hasKeys
    ? reconcileChildrenByKey
    : reconcileChildrenByPosition;

  reconcileChildren(
    oldVNode.children,
    newVNode.children,
    node,
    context,
  );

  return node;
}
