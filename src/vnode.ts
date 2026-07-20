export type EventHandler = (event: Event) => void;

export type StyleProps = Record<string, string>;

export type ElementProp = string | boolean | EventHandler | StyleProps;

export type ElementProps = Record<string, ElementProp>;

export type ElementVNode = {
  type: "element";
  tagName: string;
  props: ElementProps;
  children: VNode[];
};

export type TextVNode = {
  type: "text";
  value: string;
};

export type VNode = ElementVNode | TextVNode;

export type FunctionComponent = () => VNode;

export type VNodeChild =
  | VNode
  | string
  | number
  | boolean
  | null
  | undefined
  | VNodeChild[];

function normalizeChildren(children: VNodeChild[]): VNode[] {
  const normalizedChildren: VNode[] = [];

  for (const child of children) {
    if (Array.isArray(child)) {
      normalizedChildren.push(...normalizeChildren(child));
      continue;
    }

    if (
      child === null ||
      child === undefined ||
      typeof child === "boolean"
    ) {
      continue;
    }

    if (typeof child === "string" || typeof child === "number") {
      normalizedChildren.push({
        type: "text",
        value: String(child),
      });
      continue;
    }

    normalizedChildren.push(child);
  }

  return normalizedChildren;
}

export function h(
  tagName: string,
  props: ElementProps,
  children: VNodeChild[],
): ElementVNode;
export function h(
  component: FunctionComponent,
  props: ElementProps,
  children: VNodeChild[],
): VNode;
export function h(
  type: string | FunctionComponent,
  props: ElementProps,
  children: VNodeChild[],
): VNode {
  const normalizedChildren = normalizeChildren(children);

  if (typeof type === "function") {
    if (Object.keys(props).length > 0) {
      throw new TypeError(
        "Function component props are not supported yet.",
      );
    }

    if (normalizedChildren.length > 0) {
      throw new TypeError(
        "Function component children are not supported yet.",
      );
    }

    return type();
  }

  return {
    type: "element",
    tagName: type,
    props,
    children: normalizedChildren,
  };
}
