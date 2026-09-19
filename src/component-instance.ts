import type { ComponentVNode, VNode } from "./vnode";

export type ComponentInstance = {
  output: VNode | null;
};

const componentInstances = new WeakMap<
  ComponentVNode,
  ComponentInstance
>();

export function createComponentInstance(
  vnode: ComponentVNode,
): ComponentInstance {
  const instance: ComponentInstance = {
    output: null,
  };

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

let currentComponentInstance: ComponentInstance | null = null;

export function evaluateComponent(
  instance: ComponentInstance,
  vnode: ComponentVNode,
): VNode {
  const previousInstance = currentComponentInstance;

  currentComponentInstance = instance;

  try {
    return vnode.component(vnode.props);
  } finally {
    currentComponentInstance = previousInstance;
  }
}

export function getCurrentComponentInstance(): ComponentInstance {
  const instance = currentComponentInstance;

  if (instance === null) {
    throw new Error(
      "A component instance is only available during component evaluation.",
    );
  }

  return instance;
}
