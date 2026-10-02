# Keyed Child Reconciliation

Keyed reconciliation matches a child by its identity label before deciding
whether its old DOM node can be reused. For example:

```ts
const list = (ids: string[]) => h("ul", {},
  ids.map((id) => h("li", {}, [id], id)),
);

render(list(["a", "b", "c"]), container);
render(list(["c", "a", "b"]), container);
```

The existing `li` for `c` moves to the first position. Its DOM identity is
preserved; the renderer does not change the old first node's text to `c`.

## Snapshot Before Moving

`element.childNodes` is a live list. Moving a node changes the indices in that
list immediately, so the renderer first snapshots the old children:

```ts
const oldNodes = Array.from(element.childNodes);
```

It then builds a map whose entries retain the old relationship:

```text
key a -> old VNode a, DOM node A
key b -> old VNode b, DOM node B
key c -> old VNode c, DOM node C
```

The snapshot keeps these associations correct even while the live DOM order
changes.

## Process The New Order

For each new child, in order:

1. Look up its key in the old-child map.
2. If found, reconcile the old and new VNodes using the associated DOM node.
   A matching key still requires a compatible tag or component function.
3. If absent, mount a new DOM node.
4. Remove the consumed key from the map.
5. Place the resulting node at the new child's index with `insertBefore` if it
   is not already there.

Passing an existing node to `insertBefore` moves that node; it does not clone
it. Newly mounted nodes initially append to the parent and can then be moved
to the requested position by the same operation.

After processing the new list, entries left in the map describe removed keys.
Their DOM nodes are detached from the parent.

## Scope And Boundaries

- If both lists are unkeyed, the existing positional algorithm remains in use.
- If either list contains a key, all children in both lists must have keys.
  Empty lists satisfy this requirement.
- Keys must be unique within each sibling list; duplicates are rejected during
  mounting and reconciliation.
- Different parents have independent maps and can use the same keys.
- String and numeric keys are distinct: `0` and `"0"` identify different nodes.
- Key equality is now part of VNode compatibility, also for root VNodes.

This algorithm makes the matching and mutation boundaries visible. It does not
attempt to minimize the number of DOM moves. Updates remain synchronous and
non-transactional, and removing components does not yet add lifecycle cleanup
or deactivate retained setters.

The tests cover DOM identity during repeated reorderings, insertion, removal,
and incompatible tag replacement. The subsequent lesson in
`keyed-component-state.md` examines component state and contrasts it with
positional matching.
