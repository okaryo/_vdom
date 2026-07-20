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
type StyleProps = Record<string, string>;
type ElementProp = string | boolean | EventHandler | StyleProps;
type ElementProps = Record<string, ElementProp>;
```

During mounting, each string entry is applied with
`element.setAttribute(attributeName, value)`. Most prop names are used directly
as attribute names, while `className` maps to `class`. Each function entry must
use an `on<Event>` name and is attached with `element.addEventListener`.

## Renderer Input Versus DOM Properties

The name `props` means inputs attached to a Virtual Node. It does not mean that
every entry is immediately assigned as a JavaScript property on the real DOM
object. The renderer decides how each kind of prop reaches the browser.

String props are treated as HTML attributes. That works clearly for values such
as `id` and `data-*`, while the renderer explicitly maps `className` to the
`class` attribute. It is not a complete DOM update model: DOM properties and
HTML attributes can differ in name, type, and current value.

Function props use an `on<Event>` name and are attached with
`addEventListener`. For example, `onClick` becomes the `click` event type. This
keeps listener registration distinct from attribute serialization.

During reconciliation, string props are compared by name. Missing values remove
attributes, while new or changed values set attributes. Style entries are
compared individually, and old and new event functions are compared by
reference. Keeping these behaviors in separate boundaries makes each DOM
operation independently observable.

The first DOM property exception is `value` on `input` and `textarea`. It is
assigned to the element's live `value` property during both mounting and
reconciliation instead of becoming an HTML attribute.

The second exception is boolean `checked` on `input`. Other boolean props are
rejected until they receive an explicit renderer rule; they are not implicitly
stringified as attributes.

The third exception is `style`, which accepts an object of camelCase CSS
property names and string values. Its entries are applied to the element's live
`style` declaration and compared individually during reconciliation.

## Current Limitations

Props cannot yet contain numbers or arbitrary objects; the `style` object is the
only object-valued exception. Boolean values are currently valid only for
`checked` on `input`. Event names are derived by removing `on` and lowercasing
the remaining prop name, so custom event names with meaningful casing are not
represented. Listener options and multiple handlers for one prop are not
supported. `class` remains accepted as a direct attribute name, but using it
together with `className` on the same VNode is rejected.
