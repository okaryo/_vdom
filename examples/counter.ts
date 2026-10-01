import {
  h,
  render,
  useState,
  type FunctionComponent,
} from "../src";

export const Counter: FunctionComponent = () => {
  const [count, setCount] = useState(0);

  return h(
    "button",
    { onClick: () => setCount(count + 1) },
    [`Count: ${count}`],
  );
};

export function mountCounter(container: Node): Node {
  return render(h(Counter, {}, []), container);
}
