# Consecutive Component State Updates

The minimal `useState` implementation deliberately handles every setter call
as a complete synchronous update:

```ts
setCount(1); // stores 1, rerenders the root, and updates the DOM
setCount(2); // stores 2, rerenders the root again, and updates the DOM again
```

There is no period in which these calls are collected. When the first call
returns, the component has already been evaluated with `count === 1` and the
DOM already shows that intermediate value. The second call then repeats the
same path with `count === 2`.

```text
initial evaluation: count 0
setCount(1)       -> evaluation with count 1 -> DOM shows 1
setCount(2)       -> evaluation with count 2 -> DOM shows 2
```

Compatible reconciliation still reuses the component instance, host node, and
Text node during both renders. Repeating work does not itself imply replacing
DOM nodes.

## Why Keep This Behavior For Now?

Immediate rendering makes the entire state-to-DOM path observable. It also
provides a baseline for a later batching lesson: batching can be understood as
changing two root renders into one, rather than as unexplained framework
behavior.

This is a deliberate learning-project decision, not a claim that production UI
libraries should render after every setter call. The current implementation has
no update queue, batching boundary, scheduler, or equality bailout.

## Value Setters And Stale Closures

The setter currently accepts only a value. A component evaluation's local
`count` variable does not change when its setter is called:

```ts
const [count, setCount] = useState(0);

setCount(count + 1); // stores 1 and rerenders
setCount(count + 1); // the same closure still calculates 0 + 1
```

Both calls render synchronously, but both store `1`. Supporting updater
functions such as `setCount(current => current + 1)` would be a separate API
and update-queue decision.

## Current Decision

- Every setter call stores its value immediately.
- Every setter call synchronously renders the complete owning root.
- Consecutive calls expose intermediate rendered states.
- The last call determines the final stored value.
- No calls are batched or skipped, even when values are equal.
