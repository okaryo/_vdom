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

Reconciliation currently continues to match children by array position. Adding
a key alone therefore does not yet preserve a child's DOM or component state
when it moves. Even changing a key currently has no effect on compatibility.
The next learning unit will make child matching consume this metadata.

The intended scope is the sibling list under a single parent: separate parents
can use the same key. Matching a key will locate a candidate old child; its
element tag or component function must also be compatible for reuse. Duplicate
keys and mixed keyed/unkeyed children will need explicit decisions when that
matching behavior is implemented.
