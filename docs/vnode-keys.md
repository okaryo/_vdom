# VNode Keys

A key is a label that the renderer will use to recognize a child across
different versions of a sibling list. For example, a user ID can identify a
list item even when its array position changes.

This first step adds the representation:

```ts
const item = h("li", { className: "user" }, ["Ada"], "user-a");

// item.key === "user-a"
// item.props === { className: "user" }
```

`h` accepts a string or number as its optional fourth argument. The explicit
argument makes the boundary visible: the renderer's identity label is stored
on the VNode, separately from the properties describing the element.

## Keys And Props

Mounting the item above produces:

```html
<li class="user">Ada</li>
```

The key does not become an HTML attribute. A component key is also stored on
its VNode and is not passed to the component function:

```ts
const user = h(User, { name: "Ada" }, [], "user-a");

// User receives { name: "Ada", children: [] }.
// The renderer can read user.key separately.
```

If the component needs a user ID for its own logic, pass that ID as an ordinary
prop as well. The key and that prop serve different consumers.

## Representation Before Matching

Element, component, and explicitly constructed text VNodes now have an optional
`key` field. Existing unkeyed `h` calls keep their previous object shape.
Primitive text children are still normalized into unkeyed text VNodes.

The initial key lesson added metadata while keeping positional matching.
The subsequent implementation now consumes keys for fully keyed sibling lists;
see `keyed-child-reconciliation.md` for the matching and DOM mutation path.

The scope is the sibling list under a single parent: separate parents can use
the same key. Matching a key locates a candidate old child; its element tag or
component function must also be compatible for reuse. Duplicate sibling keys
and mixed keyed/unkeyed lists are rejected. Changing a VNode's key now also
makes it incompatible, including at the root.
