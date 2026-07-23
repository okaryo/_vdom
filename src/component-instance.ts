import type { ComponentVNode, VNode } from "./vnode";

export type ComponentInstance = {
  output: VNode;
};

const componentInstances = new WeakMap<
  ComponentVNode,
  ComponentInstance
>();

export function createComponentInstance(
  vnode: ComponentVNode,
  output: VNode,
): ComponentInstance {
  const instance = { output };

  componentInstances.set(vnode, instance);

  return instance;
}

export function reuseComponentInstance(
  oldVNode: ComponentVNode,
  newVNode: ComponentVNode,
): ComponentInstance {
  const instance = componentInstances.get(oldVNode);

  if (instance === undefined) {
    throw new Error(
      "The old component VNode has no retained component instance.",
    );
  }

  componentInstances.set(newVNode, instance);

  return instance;
}
