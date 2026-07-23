# Retained Component Boundary

The initial component implementation evaluated a function inside `h` and
returned only its output. That kept the renderer small, but erased the fact that
a component call had occurred.

`h` now creates an explicit description instead:

```ts
type ComponentVNode<Props> = {
  type: "component";
  component: FunctionComponent<Props>;
  props: Props & { children: VNode[] };
};
```

Creating this VNode remains pure. The function does not run until `mount` or
`reconcile` processes the component.

## A Boundary Without A DOM Wrapper

Mounting a component evaluates it and mounts its output:

```text
ComponentVNode(Message)
          |
          v
     Message(props)
          |
          v
    ElementVNode(<p>)
          |
          v
       HTMLParagraphElement
```

The `ComponentVNode` is part of the renderer tree, not the browser DOM tree. No
wrapper element is created for it, so both the component and its output refer
to the same root DOM node.

## The Small Internal Instance

The renderer associates each mounted `ComponentVNode` with a
`ComponentInstance`:

```ts
type ComponentInstance = {
  output: VNode;
};
```

The association is kept in a `WeakMap`. On a compatible update, the instance
is transferred from the old component VNode to the new component VNode. The
renderer can then reconcile the retained old output with the newly evaluated
output.

This is not a Fiber implementation. It is only enough retained work state to
make a component boundary and its previous output observable.

## Component Compatibility

Two component VNodes are compatible when they contain the same function and
occupy a position already matched by the surrounding reconciliation:

```text
old: Greeting({ name: "Ada" })
new: Greeting({ name: "Grace" })  -> reuse instance and output DOM
```

Different functions are incompatible:

```text
old: FirstComponent  -> <p>Same host type</p>
new: SecondComponent -> <p>Same host type</p>
                       ^ replace the DOM subtree
```

The output tag alone is no longer the whole identity decision. This gives a
later state mechanism a place to retain state while the same component
identity continues, and to discard it when that identity changes.
