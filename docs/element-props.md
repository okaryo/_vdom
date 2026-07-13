# Element Props

Element Virtual Nodes carry string or event-handler props:

```ts
const vnode: ElementVNode = {
  type: "element",
  tagName: "section",
  props: {
    id: "introduction",
    "data-topic": "virtual-dom",
  },
  children: [],
};
```

The representation remains intentionally narrow:

```ts
type EventHandler = (event: Event) => void;
type ElementProp = string | EventHandler;
type ElementProps = Record<string, ElementProp>;
```

During mounting, each string entry is applied with
`element.setAttribute(name, value)`. Each function entry must use an
`on<Event>` name and is attached with `element.addEventListener`.

## Renderer Input Versus DOM Properties

The name `props` means inputs attached to a Virtual Node. It does not mean that
every entry is immediately assigned as a JavaScript property on the real DOM
object. The renderer decides how each kind of prop reaches the browser.

String props are treated as HTML attributes. That works clearly for values such
as `id`, `class`, and `data-*`, but it is not a complete DOM update model. DOM
properties and HTML attributes can differ in name, type, and current value.

Function props use an `on<Event>` name and are attached with
`addEventListener`. For example, `onClick` becomes the `click` event type. This
keeps listener registration distinct from attribute serialization.

Later steps can introduce explicit branches for DOM properties and styles, then
compare old and new event props to replace or remove listeners. Keeping these
behaviors incremental makes each DOM operation independently observable.

## Current Limitations

Props cannot yet contain booleans, numbers, objects, or removal instructions.
Event names are derived by removing `on` and lowercasing the remaining prop
name, so custom event names with meaningful casing are not represented. Mounting
only creates a new element, so it does not compare old and new props or remove
listeners.
