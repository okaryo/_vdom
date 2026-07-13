export type ElementVNode = {
  type: "element";
  tagName: string;
  children: VNode[];
};

export type TextVNode = {
  type: "text";
  value: string;
};

export type VNode = ElementVNode | TextVNode;
