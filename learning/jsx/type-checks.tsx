// Compile-only examples verified by the project's typecheck command.
import { jsx, type FunctionComponent } from "../../src";

const Panel: FunctionComponent<{ title: string }> = ({ title, children }) => (
  <section title={title}>{children}</section>
);

<Panel title="Lesson" key={0}>Hello, <strong>Ada</strong></Panel>;
<input type="checkbox" checked={false} />;
<p title={undefined} children={["Ada", 2]} />;

// @ts-expect-error An unknown tag is outside this JSX vocabulary.
<unknownTag />;

// @ts-expect-error An input's live checked property requires a boolean.
<input checked="false" />;

// @ts-expect-error A component still requires its declared props.
<Panel />;

// @ts-expect-error A key must be a string or number.
<Panel title="Lesson" key={false} />;

// @ts-expect-error A plain object is not a VNode child.
<Panel title="Lesson">{{ label: "Ada" }}</Panel>;
