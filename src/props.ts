import type { ElementProps } from "./vnode";

function validateEventPropsAreUnchanged(
  oldProps: ElementProps,
  newProps: ElementProps,
): void {
  const names = new Set([
    ...Object.keys(oldProps),
    ...Object.keys(newProps),
  ]);

  for (const name of names) {
    const hasOldValue = Object.hasOwn(oldProps, name);
    const hasNewValue = Object.hasOwn(newProps, name);
    const oldValue = oldProps[name];
    const newValue = newProps[name];
    const hasOldHandler = hasOldValue && typeof oldValue === "function";
    const hasNewHandler = hasNewValue && typeof newValue === "function";

    if (
      (hasOldHandler || hasNewHandler) &&
      (!hasOldValue || !hasNewValue || oldValue !== newValue)
    ) {
      throw new Error(
        "Adding, replacing, or removing event handlers during reconciliation is not supported yet.",
      );
    }
  }
}

export function updateElementProps(
  oldProps: ElementProps,
  newProps: ElementProps,
  element: Element,
): void {
  validateEventPropsAreUnchanged(oldProps, newProps);

  for (const [name, oldValue] of Object.entries(oldProps)) {
    if (typeof oldValue === "string" && !Object.hasOwn(newProps, name)) {
      element.removeAttribute(name);
    }
  }

  for (const [name, newValue] of Object.entries(newProps)) {
    if (
      typeof newValue === "string" &&
      (!Object.hasOwn(oldProps, name) || oldProps[name] !== newValue)
    ) {
      element.setAttribute(name, newValue);
    }
  }
}
