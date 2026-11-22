import { jsx, type FunctionComponent } from "../../src";

export const Greeting: FunctionComponent<{ name: string }> = ({ name }) => (
  <p>{name}</p>
);

const name = "Ada";

export const element = <p className="message">Hello, {name}</p>;
export const component = <Greeting name="Ada" key="user-a" />;
