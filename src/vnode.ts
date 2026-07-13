export type ElementVNode = {
  type: "element";
  tagName: string;
};

export type TextVNode = {
  type: "text";
  value: string;
};

export type VNode = ElementVNode | TextVNode;
