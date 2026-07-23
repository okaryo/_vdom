export type EventHandler = (event: Event) => void;

export type StyleProps = Record<string, string>;

export type ElementProp = string | boolean | EventHandler | StyleProps;

export type ElementProps = Record<string, ElementProp>;

export type ComponentProps = Record<string, unknown>;

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

export type PropsWithChildren<Props extends ComponentProps> = Props & {
  children: VNode[];
};

export type FunctionComponent<
  Props extends ComponentProps = Record<never, never>,
> = (props: PropsWithChildren<Props>) => VNode;

export type ComponentVNode<
  Props extends ComponentProps = ComponentProps,
> = {
  type: "component";
  component: FunctionComponent<Props>;
  props: PropsWithChildren<Props>;
};

export type VNode =
  | ElementVNode
  | TextVNode
  | ComponentVNode<any>;

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
export function h<Props extends ComponentProps>(
  component: FunctionComponent<Props>,
  props: Props,
  children: VNodeChild[],
): ComponentVNode<Props>;
export function h<Props extends ComponentProps>(
  type: string | FunctionComponent<Props>,
  props: ElementProps | Props,
  children: VNodeChild[],
): VNode {
  const normalizedChildren = normalizeChildren(children);

  if (typeof type === "function") {
    if (Array.isArray(props)) {
      throw new TypeError(
        "Function component props must be a property object, not an array.",
      );
    }

    if (Object.hasOwn(props, "children")) {
      throw new TypeError(
        'Pass function component children as the third h argument, not as a "children" prop.',
      );
    }

    return {
      type: "component",
      component: type,
      props: {
        ...props,
        children: normalizedChildren,
      } as PropsWithChildren<Props>,
    };
  }

  return {
    type: "element",
    tagName: type,
    props: props as ElementProps,
    children: normalizedChildren,
  };
}
