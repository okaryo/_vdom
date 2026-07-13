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
