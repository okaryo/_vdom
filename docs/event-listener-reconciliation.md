# Event Listener Reconciliation

A compatible element keeps its DOM identity while its event handler props can
change. The renderer compares each old and new handler by function reference:

| Old handler | New handler | DOM operation |
| --- | --- | --- |
| Missing | Function | `addEventListener` |
| Same function | Same function | None |
| Old function | Different function | Remove old, then add new |
| Function | Missing | `removeEventListener` |

## Why Function Identity Matters

`removeEventListener` must receive the same function object that was previously
passed to `addEventListener`:

```ts
element.addEventListener("click", oldHandler);
element.removeEventListener("click", oldHandler);
```

Creating an equivalent new function would not remove the registered listener.
The retained old VNode already contains `oldHandler`, so this renderer does not
need another map from elements to handlers.

## Replacement Order

When a handler changes, the renderer removes the old function before attaching
the new function:

```ts
element.removeEventListener("click", oldHandler);
element.addEventListener("click", newHandler);
```

Leaving out the removal would accumulate handlers across renders. One click
would then call both the obsolete and current functions.

## Element Identity

Changing a listener does not make two element VNodes incompatible. The existing
DOM element is reused; only its browser event-target listener list changes.

## Deliberate Limits

The event type is still derived by removing `on` and lowercasing the remainder,
so `onClick` becomes `click`. The renderer does not support listener options,
multiple handlers for one prop, custom casing rules, or React's synthetic event
semantics.
