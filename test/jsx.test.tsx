import { describe, expect, it } from "vitest";

import { component, element, Greeting } from "../learning/jsx/expression";
import { h, jsx, render } from "../src";

describe("classic JSX adapter", () => {
  it("passes JSX attributes and multiple children to the renderer", () => {
    const container = document.createElement("div");

    render(element, container);

    expect(container.innerHTML).toBe('<p class="message">Hello, Ada</p>');
  });

  it("keeps a JSX key on the component VNode and handles a tag with no attributes", () => {
    const container = document.createElement("div");

    expect(component).toEqual({
      type: "component",
      key: "user-a",
      component: expect.any(Function),
      props: { name: "Ada", children: [] },
    });

    render(component, container);

    expect(container.innerHTML).toBe("<p>Ada</p>");
  });

  it("normalizes an explicit children prop and omits undefined host attributes", () => {
    const container = document.createElement("div");

    render(jsx("p", { title: undefined, children: ["Ada", 2] }), container);

    expect(container.innerHTML).toBe("<p>Ada2</p>");
  });
});

describe("JSX and handwritten VNodes", () => {
  it("creates equivalent component VNodes with JSX and h", () => {
    const fromJsx = <Greeting name="Ada" key="user-a" />;
    const fromH = h(Greeting, { name: "Ada" }, [], "user-a");

    expect(fromJsx).not.toBe(fromH);
    expect(fromJsx).toEqual(fromH);
  });

  it("reuses the DOM when switching from h to JSX and updating props", () => {
    const container = document.createElement("div");
    const before = render(h(Greeting, { name: "Ada" }, [], "user-a"), container);
    const text = before.firstChild;

    expect(container.innerHTML).toBe("<p>Ada</p>");

    const after = render(<Greeting name="Grace" key="user-a" />, container);

    expect(container.innerHTML).toBe("<p>Grace</p>");
    expect(after).toBe(before);
    expect(after.firstChild).toBe(text);
  });
});
