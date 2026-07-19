import type { ElementProps } from "./vnode";

function eventTypeFromPropName(propName: string): string {
  if (!propName.startsWith("on") || propName.length === 2) {
    throw new TypeError(
      `Event handler prop "${propName}" must start with "on" followed by an event name.`,
    );
  }

  return propName.slice(2).toLowerCase();
}

function usesValueProperty(
  propName: string,
  element: Element,
): element is HTMLInputElement | HTMLTextAreaElement {
  return (
    propName === "value" &&
    (element instanceof HTMLInputElement ||
      element instanceof HTMLTextAreaElement)
  );
}

export function applyInitialElementProps(
  props: ElementProps,
  element: Element,
): void {
  for (const [name, value] of Object.entries(props)) {
    if (typeof value === "function") {
      element.addEventListener(eventTypeFromPropName(name), value);
      continue;
    }

    if (usesValueProperty(name, element)) {
      element.value = value;
      continue;
    }

    element.setAttribute(name, value);
  }
}

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

  if (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  ) {
    const hasOldValue = Object.hasOwn(oldProps, "value");
    const hasNewValue = Object.hasOwn(newProps, "value");
    const newValue = newProps.value;

    if (hasNewValue && typeof newValue === "string") {
      if (element.value !== newValue) {
        element.value = newValue;
      }
    } else if (hasOldValue && !hasNewValue && element.value !== "") {
      element.value = "";
    }
  }

  for (const [name, oldValue] of Object.entries(oldProps)) {
    if (
      typeof oldValue === "string" &&
      !usesValueProperty(name, element) &&
      !Object.hasOwn(newProps, name)
    ) {
      element.removeAttribute(name);
    }
  }

  for (const [name, newValue] of Object.entries(newProps)) {
    if (
      typeof newValue === "string" &&
      !usesValueProperty(name, element) &&
      (!Object.hasOwn(oldProps, name) || oldProps[name] !== newValue)
    ) {
      element.setAttribute(name, newValue);
    }
  }
}
