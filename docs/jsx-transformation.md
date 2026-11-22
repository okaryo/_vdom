# Inspecting JSX Transformation

JSX describes function calls using markup-like syntax. This lesson follows the
generated calls through the factory adapter to `h`.

Run the inspection command to see the generated calls.

```sh
pnpm jsx:inspect
```

`learning/jsx/expression.tsx` contains a host element and a component expression.

```tsx
import { jsx, type FunctionComponent } from "../../src";

export const Greeting: FunctionComponent<{ name: string }> = ({ name }) => (
  <p>{name}</p>
);
const name = "Ada";

export const element = <p className="message">Hello, {name}</p>;
export const component = <Greeting name="Ada" key="user-a" />;
```

The script invokes the installed TypeScript compiler with `jsx: react` and
`jsxFactory: jsx`. Here `react` selects the classic JSX emit format, and `jsx`
names the function used in the generated calls.

```js
import { jsx } from "../../src";
export const Greeting = ({ name }) => (jsx("p", null, name));
const name = "Ada";
export const element = jsx("p", { className: "message" },
    "Hello, ",
    name);
export const component = jsx(Greeting, { name: "Ada", key: "user-a" });
```

## What The Compiler Does

- A lowercase host tag becomes a string argument: `<p>` becomes `"p"`.
- A component name becomes a variable argument: `<Greeting>` becomes `Greeting`.
- Attributes become an object; no attributes produce `null`.
- Children become successive arguments after the props argument.
- Expressions in braces remain JavaScript expressions, such as the `name`
  variable above.
- In this classic emit format, `key` is included in the props object.
- TypeScript type annotations are erased.

The compiler does not call `render`, create DOM nodes, evaluate components on
its own, or compare trees. The factory and renderer define those behaviors.

## How `jsx` Adapts The Call To `h`

These are the equivalent calls to the handwritten factory.

```ts
h("p", {}, [name]);
h("p", { className: "message" }, ["Hello, ", name]);
h(Greeting, { name: "Ada" }, [], "user-a");
```

The adapter converts three parts of the call.

| Classic JSX output | Current `h` input |
| --- | --- |
| `null` when attributes are absent | A props object |
| Children passed as separate arguments, or no child argument | One children array |
| `key` inside the props object | A separate fourth argument |

`jsx` uses a rest parameter to collect the child arguments into an array.
It destructures `key` out of the props object and passes it separately to `h`,
which stores it on the VNode. `h` also continues to normalize children and
build the VNode supplied to `render`.

## Inspection Scope

The inspection command prints the source and generated JavaScript and cleans up
its temporary output. `test/jsx.test.tsx` imports the same TSX specimen and
renders the element and component examples. Vitest uses classic JSX from
`tsconfig.json`. Its [Oxc setting](https://vite.dev/config/shared-options.html#oxc) disables the
extra debug props that the development transform would otherwise generate.

## What TypeScript Checks

With `jsxFactory: jsx`, TypeScript looks for types under `jsx.JSX`. The
declarations in `src/jsx.ts` describe the JSX call site.

- `JSX.Element` is `VNode`, so a JSX expression can be passed to `render`.
- `JSX.IntrinsicElements` takes tag names from `HTMLElementTagNameMap` and
  gives them a small shared set of supported attributes. It adds `checked`
  as a boolean on `input`.
- `JSX.IntrinsicAttributes` declares the optional `key`. Component-specific
  props come from the component function's parameter type.
- `JSX.ElementChildrenAttribute` names `children` as the field used to check
  nested JSX. `JSX.LibraryManagedAttributes` lets callers pass optional
  `VNodeChild` values to components that receive a normalized `VNode[]`.

The adapter uses an explicit `children` attribute as a fallback when there
are no nested children. It treats `undefined` host attributes as omitted.
`h` normalizes either form of children before the component receives them.

`pnpm typecheck` checks the sample and the `@ts-expect-error` cases in
`learning/jsx/type-checks.tsx`. The host attribute types cover only a subset of
what the handwritten renderer accepts.

## Comparing JSX With Handwritten `h`

Both expressions describe a `Greeting` with the same props, children, and key.
The comparison test uses `toEqual` for their contents and `not.toBe` for their
object references. Each call creates its own VNode.

```tsx
const fromJsx = <Greeting name="Ada" key="user-a" />;
const fromH = h(Greeting, { name: "Ada" }, [], "user-a");
```

The rendering test starts with the handwritten `h` call and then renders
`<Greeting name="Grace" key="user-a" />` into the same container. The key and
component function still match. The component is evaluated with the new name,
and reconciliation updates the existing Text node. Both the `p` element and
the Text node keep their object identities.

This puts the boundary at the VNode. JSX transformation determines how the
VNode is created. `render` works with the resulting VNodes and decides how to
update the DOM.
