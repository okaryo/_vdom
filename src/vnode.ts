export type EventHandler = (event: Event) => void;

export type ElementProp = string | boolean | EventHandler;

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
): ElementVNode {
  return {
    type: "element",
    tagName,
    props,
    children: normalizeChildren(children),
  };
}
