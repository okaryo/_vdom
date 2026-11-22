// Compilation specimen: inspect the emitted calls before connecting a factory.
const Greeting = ({ name }: { name: string }) => <p>{name}</p>;

const name = "Ada";

export const element = <p className="message">Hello, {name}</p>;
export const component = <Greeting name="Ada" key="user-a" />;
