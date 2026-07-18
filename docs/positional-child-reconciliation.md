# Positional Child Reconciliation

Compatible elements reconcile their child arrays by index. Position zero in the
old array is compared with position zero in the new array, position one with
position one, and so on.

```text
old: [A, B]
      |  |
new: [A', B']
```

The algorithm has three phases:

1. Reconcile the shared positions from `0` to the shorter array length.
2. Mount any extra new children at the end.
3. Remove any extra old DOM children from the end.

Before these phases, the renderer checks that the real element child count
matches the retained old VNode child count.

## Recursive Reuse

Reconciliation at a shared position calls the same `reconcile` function again.
This makes the operation recursive:

```text
ul at position root       -> reuse ul
  li at position 0        -> reuse li
    text at position 0    -> update Text.data
  li at position 1        -> reuse li
  li at new position 2    -> mount new li
```

Each compatible DOM node keeps its identity. The test observes the root, both
existing `<li>` nodes, and the updated nested text node rather than checking
only the final HTML.

## Why Position Can Be Surprising

The algorithm does not search later positions for a matching node. Consider:

```text
old: [<p>remove</p>, <button>keep</button>]
new: [<button>keep</button>]
```

At position zero, `<p>` and `<button>` are incompatible, so the `<p>` is
replaced with a new `<button>`. The old button at position one is then surplus
and removed. Although the button content appears unchanged, its DOM identity is
not preserved.

This is the central limitation that keys will address later: a key lets the
renderer identify a logical child independently of its array position.

## Current Limitations

The renderer applies mutations as it walks from left to right rather than
validating the complete subtree first. An unsupported event-handler update
found in a later sibling can therefore occur after an earlier sibling was
already changed. This non-transactional behavior is an explicit limitation of
the current learning implementation.
