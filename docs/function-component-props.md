# Function Component Props

Function components use a generic string-keyed props type rather than
`ElementProps`:

```ts
type GreetingProps = {
  name: string;
  count: number;
};

const Greeting: FunctionComponent<GreetingProps> = ({ name, count }) =>
  h("p", {}, [`${name}: ${count}`]);
```

The call to `h` preserves that relationship:

```ts
h(Greeting, { name: "Ada", count: 2 }, []);
```

TypeScript checks the object against `GreetingProps`, then the implementation
creates a new object that adds normalized `children` before calling `Greeting`.

## Component Props Versus Host Props

Component props are ordinary application inputs. They can use values such as
numbers and domain objects because they are consumed by JavaScript code:

```text
{ name: "Ada", count: 2 }
          |
          v
Greeting(props)
          |
          v
ElementVNode for <p>Ada: 2</p>
```

Host `ElementProps` are different. They cross the renderer-to-browser boundary,
so their supported strings, booleans, styles, and functions are interpreted as
attributes, selected DOM properties, CSS declarations, or listeners.

Component props do not automatically become DOM attributes. The component must
choose which values appear in its returned host VNode.

The props container itself is a named property object. An array is data inside
a prop rather than the entire props value:

```ts
h(List, { items: ["one", "two"] }, []); // supported shape
```

This makes room for the reserved `children` property and future named inputs.

## Reconciliation Of Changed Props

Because components are still expanded eagerly, changing their props calls the
function with new data and produces a new ordinary VNode. The existing renderer
then compares that output with the previous output:

```text
Greeting({ name: "Ada" })   -> <p>Hello, Ada</p>
Greeting({ name: "Grace" }) -> <p>Hello, Grace</p>
```

Both outputs are compatible `p` VNodes, so the same paragraph and Text node can
be reused while `Text.data` changes.

The component function and its props are not retained as their own internal
node yet. Reconciliation sees only the expanded output, so component-specific
identity and state remain unsupported.
