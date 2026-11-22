# Inspecting JSX Transformation

JSX describes function calls using markup-like syntax. This lesson inspects
the generated JavaScript before connecting those calls to the local renderer.

Run the compilation specimen with:

```sh
pnpm jsx:inspect
```

`learning/jsx/expression.tsx` contains a host element and a component expression:

```tsx
const Greeting = ({ name }: { name: string }) => <p>{name}</p>;
const name = "Ada";

export const element = <p className="message">Hello, {name}</p>;
export const component = <Greeting name="Ada" key="user-a" />;
```

The script invokes the installed TypeScript compiler with `jsx: react` and
`jsxFactory: h`. In this configuration, `react` selects the classic JSX emit
format; it does not install React or import it into the output. The compiler
emits calls to the configured factory identifier, `h`:

```js
const Greeting = ({ name }) => h("p", null, name);
const name = "Ada";
export const element = h("p", { className: "message" },
    "Hello, ",
    name);
export const component = h(Greeting, { name: "Ada", key: "user-a" });
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

## Why These Calls Do Not Yet Fit `h`

The current handwritten API expects:

```ts
h("p", { className: "message" }, ["Hello, ", name]);
h(Greeting, { name: "Ada" }, [], "user-a");
```

There are three differences to bridge:

| Classic JSX output | Current `h` input |
| --- | --- |
| `null` when attributes are absent | A props object |
| Children passed as separate arguments, or no child argument | One children array |
| `key` inside the props object | A separate fourth argument |

Merely setting the factory name to `h` does not solve these differences. In the
element example, `name` would even occupy the argument that `h` treats as the
key. The next lesson will introduce a small adapter that accepts the emitted
arguments, normalizes them, and delegates VNode creation to `h`.

That adapter will also extract `key` from JSX props so it remains renderer
metadata rather than an HTML attribute or an ordinary component prop.

## Inspection Scope

The specimen is outside the main TypeScript project's `include` paths. The
inspection command uses `--noCheck` to observe emission before a factory binding
and JSX type declarations exist. It prints the source and generated JavaScript,
then removes its temporary output directory. It does not execute the output.

The application's strict type checking remains enabled. JSX runtime support
and JSX type checking are separate upcoming steps; other JSX emit modes and
fragments are outside this first inspection lesson.
