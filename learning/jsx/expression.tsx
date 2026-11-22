// @ts-nocheck: JSX type declarations are introduced in the next lesson.
import { jsx } from "../../src";

const Greeting = ({ name }: { name: string }) => <p>{name}</p>;

const name = "Ada";

export const element = <p className="message">Hello, {name}</p>;
export const component = <Greeting name="Ada" key="user-a" />;
