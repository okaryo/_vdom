# Minimal Function Components

The first component form is a function that receives typed props and returns one
existing VNode:

```ts
type FunctionComponent<Props extends ComponentProps> = (
  props: Props & { children: VNode[] },
) => VNode;

const Message: FunctionComponent<{ name: string }> = ({ name }) =>
  h("p", { className: "message" }, [`Hello, ${name}`]);
```

It is used by passing the function itself to `h`:

```ts
const vnode = h(Message, { name: "Ada" }, []);
render(vnode, container);
```

The resulting DOM contains only the component's output:

```html
<p class="message">Hello, Ada</p>
```

There is no component wrapper element.

## Eager Expansion

The current call flow is deliberately small:

```text
h(Message, { name: "Ada" }, [])
  -> Message({ name: "Ada", children: [] })
  -> h("p", ..., ["Hello, Ada"])
  -> ElementVNode
  -> render / mount / reconcile
```

`Message` runs while the VNode tree is being created, before `render` receives
the tree. The renderer therefore needs no new component branch: it sees only
the returned element or text VNode.

This answers the first component-boundary question with a temporary minimal
model: the component is a VNode-producing function, not a new VNode kind.

## Identity Consequence

Because the function call is not represented in the retained tree, the
component has no independent identity. Reconciliation can preserve or replace
the output DOM according to the returned VNode's existing rules, but it cannot
associate state or lifecycle work with `Message` itself.

This is enough to expose component evaluation without adding an internal
component instance or Fiber-like structure. A later state lesson may show why
retaining a component boundary becomes useful.

## Children Boundary

Third-argument children are normalized before the component runs:

```ts
h(Message, { name: "Ada" }, ["child"]);
// Message receives:
// { name: "Ada", children: [{ type: "text", value: "child" }] }
```

`children` is reserved for this normalized array. Supplying it directly inside
the second argument is rejected so that there is only one child-input path.
