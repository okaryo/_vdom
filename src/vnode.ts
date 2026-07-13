export type ElementProps = Record<string, string>;

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

export type VNodeChild = VNode | string | number;

function normalizeChild(child: VNodeChild): VNode {
  if (typeof child === "string" || typeof child === "number") {
    return {
      type: "text",
      value: String(child),
    };
  }

  return child;
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
    children: children.map(normalizeChild),
  };
}
