# Component State Across List Reordering

Keys affect which retained component instance is selected, not only which DOM
node is moved. This lesson compares the same stateful list in three modes:
stable ID keys, no keys, and array-index keys.

Each item uses the same component function:

```ts
const ItemCounter: FunctionComponent<{ label: string }> = ({ label }) => {
  const [count, setCount] = useState(0);

  return h("button", { onClick: () => setCount(count + 1) }, [
    `${label}: ${count}`,
  ]);
};
```

First render `a, b` and click `a` once. The visible values are now `a: 1, b: 0`.
Next render the order `b, a`, creating new component VNodes.

| Matching mode | Output after reordering | Where the first item's instance goes |
| --- | --- | --- |
| Stable IDs (`a`, `b`) | `b: 0, a: 1` | Moves to the second position with `a` |
| No keys | `b: 1, a: 0` | Stays at position 0, now receiving label `b` |
| Array indices (`0`, `1`) | `b: 1, a: 0` | Stays with key `0`, now receiving label `b` |

## Stable Keys Preserve Item Identity

Create each component VNode with the item's stable ID:

```ts
h(ItemCounter, { label }, [], label);
```

The old-child map finds the old `a` VNode regardless of its new position.
Because its key and component function match, `reuseComponentInstance` retains
the same instance, state slot, and setter. The updated output is reconciled,
then the existing button is moved to the requested position.

State is not copied into another instance. The same instance continues to own
it. The button and its Text node also remain the same objects in this example.
Clicking the moved `a` button again changes its count from 1 to 2, confirming
that its handler and root render context still work after the move.

## Positional Matching Preserves Position Identity

Without keys, position 0 in the new list is matched with position 0 in the old
list. Both VNodes use `ItemCounter`, so their instances are compatible even
though their `label` props differ.

The old first instance retains count 1 and receives the new label `b`. Its
button is reused in place and now displays `b: 1`. The old second instance
retains count 0 and receives label `a`.

Changing a prop does not create a fresh state slot. The renderer does not infer
item identity from `label`, even when that prop looks like an ID.

## Why Index Keys Behave The Same Here

If the key is assigned from the array index, key `0` identifies `a` before the
reorder but `b` afterward. The keyed algorithm still works as specified: it
preserves the instance associated with key `0`.

The problem is that the supplied key identifies a position rather than a data
item. A stable ID follows an item when it moves; an array index follows a slot.

## Put The Key On The Matched Boundary

These tests place keys on the `ItemCounter` VNodes that are direct siblings.
Putting a key only on the button returned inside `ItemCounter` would not
identify the component among its siblings. Parent child matching sees the
component VNodes first.

Keys are local to a sibling list. They do not preserve state when an item moves
to another parent, changes component function, or is removed and later mounted
again. Preserving a component instance also does not guarantee that every DOM
node in its output will survive: incompatible output types are still replaced.
