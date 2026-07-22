# Function Component Children

Function components receive normalized children as part of their props:

```ts
type PanelProps = {
  title: string;
};

const Panel: FunctionComponent<PanelProps> = ({ title, children }) =>
  h("section", {}, [
    h("h2", {}, [title]),
    h("div", { className: "body" }, children),
  ]);
```

Callers continue to pass children as the third `h` argument:

```ts
h(Panel, { title: "Lesson" }, [
  "Introduction",
  h("p", {}, ["Content"]),
]);
```

## Normalize Before Evaluation

The same child normalization used for host elements runs before the component:

```text
["Introduction", 2, null, false]
                 |
                 v
[
  TextVNode("Introduction"),
  TextVNode("2"),
]
```

The component therefore receives a canonical `VNode[]`. It does not need to
understand primitive children, nested arrays, or omitted boolean and nullish
values.

`h` creates a new props object instead of mutating the object supplied by the
caller:

```ts
const componentProps = {
  ...props,
  children: normalizedChildren,
};
```

The name `children` is reserved. Passing it directly in the second argument is
rejected so there is one unambiguous source of component children.

## Eager Composition

Components can return host VNodes containing their received children, and a
child can itself be another eagerly expanded component:

```text
h(Badge, ...) -> <span> output VNode
                         |
                         v
h(Card, ..., [badge output, <p>])
                         |
                         v
<article><span>...</span><p>...</p></article> VNode tree
```

The browser DOM contains only host elements. No `Card` or `Badge` wrapper node
is created.

Because expansion remains eager, this composition still does not retain a
component tree or component-specific identity. It only constructs a larger
ordinary VNode tree for the existing renderer.

## Props Shape Decision

Component props are constrained to a string-keyed property object. Passing an
array as the entire props value is intentionally unsupported:

```ts
h(List, ["one", "two"], []);            // unsupported
h(List, { items: ["one", "two"] }, []); // supported
```

This is narrower than TypeScript's lowercase `object` type, which also includes
arrays, functions, and class instances. The narrower shape matches the named
input model used when `children` is injected.

The default no-named-props type is `Record<never, never>`. Its declared key set
is empty, so it can be combined with the injected `children` property.
`Record<string, never>` would instead say that every possible string key,
including `children`, must have the impossible `never` value.
