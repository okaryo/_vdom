import {
  h,
  type ComponentProps,
  type ElementProps,
  type EventHandler,
  type FunctionComponent,
  type StyleProps,
  type VNode,
  type VNodeChild,
  type VNodeKey,
} from "./vnode";

export function jsx(
  type: string | FunctionComponent<any>,
  props: (ComponentProps & { children?: VNodeChild }) | null,
  ...children: VNodeChild[]
): VNode {
  const { key, children: childrenProp, ...vnodeProps } = props ?? {};

  if (key !== undefined && typeof key !== "string" && typeof key !== "number") {
    throw new TypeError("A JSX key must be a string or number.");
  }

  if (children.length === 0 && childrenProp !== undefined) {
    children.push(childrenProp);
  }

  if (typeof type === "string") {
    const elementProps = Object.fromEntries(
      Object.entries(vnodeProps).filter(([, value]) => value !== undefined),
    ) as ElementProps;

    return h(type, elementProps, children, key);
  }

  return h(type, vnodeProps, children, key);
}

type HostAttributes = {
  id?: string;
  class?: string;
  className?: string;
  title?: string;
  type?: string;
  name?: string;
  value?: string;
  style?: StyleProps;
  children?: VNodeChild;
  [attribute: `data-${string}` | `aria-${string}`]: string | undefined;
  [event: `on${string}`]: EventHandler | undefined;
};

export declare namespace jsx.JSX {
  type Element = VNode;

  interface IntrinsicAttributes {
    key?: VNodeKey;
  }

  interface ElementChildrenAttribute {
    children: unknown;
  }

  type IntrinsicElements = {
    [Tag in keyof HTMLElementTagNameMap]: HostAttributes & IntrinsicAttributes
      & (Tag extends "input" ? { checked?: boolean } : {});
  };

  // The renderer supplies normalized children when it evaluates the component.
  type LibraryManagedAttributes<_Component, Props> =
    Props extends { children: VNode[] }
      ? Omit<Props, "children"> & { children?: VNodeChild }
      : Props;
}
