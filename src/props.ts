import type { ElementProp, ElementProps, StyleProps } from "./vnode";

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

function usesCheckedProperty(
  propName: string,
  element: Element,
): element is HTMLInputElement {
  return propName === "checked" && element instanceof HTMLInputElement;
}

function attributeNameFromPropName(propName: string): string {
  return propName === "className" ? "class" : propName;
}

function isStyleProps(value: ElementProp): value is StyleProps {
  return typeof value === "object" && value !== null;
}

function cssPropertyNameFromStyleName(styleName: string): string {
  if (styleName.startsWith("--")) {
    return styleName;
  }

  return styleName.replace(
    /[A-Z]/g,
    (character) => `-${character.toLowerCase()}`,
  );
}

function styleDeclarationFor(element: Element): CSSStyleDeclaration {
  if (!(element instanceof HTMLElement)) {
    throw new TypeError(
      `The "style" prop is only supported on HTML elements.`,
    );
  }

  return element.style;
}

function validateStyleProps(value: ElementProp, element: Element): void {
  if (!isStyleProps(value)) {
    throw new TypeError(
      `The "style" prop on ${element.tagName.toLowerCase()} must be an object of string values.`,
    );
  }

  for (const [styleName, styleValue] of Object.entries(value)) {
    if (typeof styleValue !== "string") {
      throw new TypeError(
        `Style property "${styleName}" on ${element.tagName.toLowerCase()} must be a string.`,
      );
    }
  }
}

function updateStyleProps(
  oldStyle: StyleProps,
  newStyle: StyleProps,
  element: Element,
): void {
  const declaration = styleDeclarationFor(element);

  for (const styleName of Object.keys(oldStyle)) {
    if (!Object.hasOwn(newStyle, styleName)) {
      declaration.removeProperty(cssPropertyNameFromStyleName(styleName));
    }
  }

  for (const [styleName, newValue] of Object.entries(newStyle)) {
    if (!Object.hasOwn(oldStyle, styleName) || oldStyle[styleName] !== newValue) {
      declaration.setProperty(
        cssPropertyNameFromStyleName(styleName),
        newValue,
      );
    }
  }
}

function validateManagedPropTypes(
  props: ElementProps,
  element: Element,
): void {
  if (Object.hasOwn(props, "class") && Object.hasOwn(props, "className")) {
    throw new TypeError(
      'Use either "class" or "className", not both on the same element.',
    );
  }

  for (const [name, value] of Object.entries(props)) {
    if (name === "style") {
      validateStyleProps(value, element);
      styleDeclarationFor(element);
      continue;
    }

    if (isStyleProps(value)) {
      throw new TypeError(`Object prop "${name}" is not supported.`);
    }

    if (typeof value === "function") {
      eventTypeFromPropName(name);
      continue;
    }

    if (usesValueProperty(name, element) && typeof value !== "string") {
      throw new TypeError(
        `The "value" prop on ${element.tagName.toLowerCase()} must be a string.`,
      );
    }

    if (usesCheckedProperty(name, element) && typeof value !== "boolean") {
      throw new TypeError('The "checked" prop on input must be a boolean.');
    }

    if (typeof value === "boolean" && !usesCheckedProperty(name, element)) {
      throw new TypeError(
        `Boolean prop "${name}" is not supported on ${element.tagName.toLowerCase()}.`,
      );
    }
  }
}

export function applyInitialElementProps(
  props: ElementProps,
  element: Element,
): void {
  validateManagedPropTypes(props, element);

  for (const [name, value] of Object.entries(props)) {
    if (name === "style") {
      updateStyleProps({}, value as StyleProps, element);
      continue;
    }

    if (usesValueProperty(name, element)) {
      element.value = value as string;
      continue;
    }

    if (usesCheckedProperty(name, element)) {
      element.checked = value as boolean;
      continue;
    }

    if (typeof value === "function") {
      element.addEventListener(eventTypeFromPropName(name), value);
      continue;
    }

    if (typeof value !== "string") {
      throw new TypeError(`Unsupported prop "${name}".`);
    }

    element.setAttribute(attributeNameFromPropName(name), value);
  }
}

function updateEventProps(
  oldProps: ElementProps,
  newProps: ElementProps,
  element: Element,
): void {
  const names = new Set([
    ...Object.keys(oldProps),
    ...Object.keys(newProps),
  ]);

  for (const name of names) {
    const oldValue = oldProps[name];
    const newValue = newProps[name];
    const oldHandler = typeof oldValue === "function" ? oldValue : undefined;
    const newHandler = typeof newValue === "function" ? newValue : undefined;

    if (oldHandler === newHandler) {
      continue;
    }

    const handler = oldHandler ?? newHandler;

    if (handler === undefined) {
      continue;
    }

    const eventType = eventTypeFromPropName(name);

    if (oldHandler !== undefined) {
      element.removeEventListener(eventType, oldHandler);
    }

    if (newHandler !== undefined) {
      element.addEventListener(eventType, newHandler);
    }
  }
}

export function updateElementProps(
  oldProps: ElementProps,
  newProps: ElementProps,
  element: Element,
): void {
  validateManagedPropTypes(oldProps, element);
  validateManagedPropTypes(newProps, element);
  updateEventProps(oldProps, newProps, element);

  const oldStyleValue = oldProps.style;
  const newStyleValue = newProps.style;
  const oldStyle = isStyleProps(oldStyleValue) ? oldStyleValue : {};
  const newStyle = isStyleProps(newStyleValue) ? newStyleValue : {};

  if (
    Object.hasOwn(oldProps, "style") ||
    Object.hasOwn(newProps, "style")
  ) {
    updateStyleProps(oldStyle, newStyle, element);
  }

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

  if (element instanceof HTMLInputElement) {
    const hasOldChecked = Object.hasOwn(oldProps, "checked");
    const hasNewChecked = Object.hasOwn(newProps, "checked");
    const newChecked = newProps.checked;

    if (hasNewChecked && typeof newChecked === "boolean") {
      if (element.checked !== newChecked) {
        element.checked = newChecked;
      }
    } else if (hasOldChecked && !hasNewChecked && element.checked) {
      element.checked = false;
    }
  }

  for (const [name, oldValue] of Object.entries(oldProps)) {
    if (
      typeof oldValue === "string" &&
      !usesValueProperty(name, element) &&
      !usesCheckedProperty(name, element) &&
      (!Object.hasOwn(newProps, name) ||
        typeof newProps[name] !== "string")
    ) {
      element.removeAttribute(attributeNameFromPropName(name));
    }
  }

  for (const [name, newValue] of Object.entries(newProps)) {
    if (
      typeof newValue === "string" &&
      !usesValueProperty(name, element) &&
      !usesCheckedProperty(name, element) &&
      (typeof oldProps[name] !== "string" || oldProps[name] !== newValue)
    ) {
      element.setAttribute(attributeNameFromPropName(name), newValue);
    }
  }
}
