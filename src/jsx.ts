import {
  h,
  type ComponentProps,
  type ElementProps,
  type FunctionComponent,
  type VNode,
  type VNodeChild,
} from "./vnode";

export function jsx(
  type: string | FunctionComponent<any>,
  props: ComponentProps | null,
  ...children: VNodeChild[]
): VNode {
  const { key, ...vnodeProps } = props ?? {};

  if (key !== undefined && typeof key !== "string" && typeof key !== "number") {
    throw new TypeError("A JSX key must be a string or number.");
  }

  if (typeof type === "string") {
    return h(type, vnodeProps as ElementProps, children, key);
  }

  return h(type, vnodeProps, children, key);
}
