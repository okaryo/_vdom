import type { VNode, VNodeKey } from "./vnode";

export function validateKeyedChildren(children: VNode[]): void {
  const keys = new Set<VNodeKey>();

  for (const child of children) {
    if (child.key === undefined) {
      throw new Error("Keyed child lists must give every child a key.");
    }

    if (keys.has(child.key)) {
      throw new Error(`Duplicate child key: ${child.key}.`);
    }

    keys.add(child.key);
  }
}
