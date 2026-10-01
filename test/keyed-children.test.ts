import { describe, expect, it } from "vitest";

import { h, render, type VNodeKey } from "../src";

const list = (keys: VNodeKey[]) =>
  h("ul", {}, keys.map((key) => h("li", {}, [String(key)], key)));

describe("keyed child reconciliation", () => {
  it("moves existing nodes by key across successive reorderings", () => {
    const container = document.createElement("div");
    const root = render(list(["a", "b", "c"]), container);
    const [a, b, c] = Array.from(root.childNodes);
    const aText = a.firstChild;

    render(list(["c", "a", "b"]), container);

    expect(root.childNodes.item(0)).toBe(c);
    expect(root.childNodes.item(1)).toBe(a);
    expect(root.childNodes.item(2)).toBe(b);

    render(list(["b", "c", "a"]), container);

    expect(root.childNodes.item(0)).toBe(b);
    expect(root.childNodes.item(1)).toBe(c);
    expect(root.childNodes.item(2)).toBe(a);
    expect(a.firstChild).toBe(aText);
    expect(container.firstChild).toBe(root);
    expect(container.innerHTML).toBe("<ul><li>b</li><li>c</li><li>a</li></ul>");
  });

  it("inserts new keys and removes old keys while retaining matched nodes", () => {
    const container = document.createElement("div");
    const root = render(list(["a", "b", "c"]), container);
    const [a, b, c] = Array.from(root.childNodes);

    render(list(["d", "c", "a"]), container);

    expect(root.childNodes.item(1)).toBe(c);
    expect(root.childNodes.item(2)).toBe(a);
    expect(b.parentNode).toBeNull();
    expect(container.innerHTML).toBe("<ul><li>d</li><li>c</li><li>a</li></ul>");

    render(list([]), container);
    expect(root.childNodes).toHaveLength(0);

    render(list(["e"]), container);
    expect(container.innerHTML).toBe("<ul><li>e</li></ul>");
  });

  it("replaces a matched key when the host type changes", () => {
    const container = document.createElement("div");
    const root = render(list(["a", "b"]), container);
    const [a, b] = Array.from(root.childNodes);

    render(h("ul", {}, [
      h("p", {}, ["B updated"], "b"),
      h("li", {}, ["A updated"], "a"),
    ]), container);

    expect(root.childNodes.item(0)).not.toBe(b);
    expect(b.parentNode).toBeNull();
    expect(root.childNodes.item(1)).toBe(a);
    expect(container.innerHTML).toBe("<ul><p>B updated</p><li>A updated</li></ul>");
  });

  it("distinguishes numeric keys from string keys, including zero", () => {
    const container = document.createElement("div");
    const root = render(list([0, "0"]), container);
    const [numeric, string] = Array.from(root.childNodes);

    render(list(["0", 0]), container);

    expect(root.childNodes.item(0)).toBe(string);
    expect(root.childNodes.item(1)).toBe(numeric);
  });

  it("rejects duplicate keys before changing child nodes", () => {
    const container = document.createElement("div");
    const root = render(list(["a", "b"]), container);
    const first = root.firstChild;

    expect(() => render(list(["a", "a"]), container)).toThrow(
      "Duplicate child key: a.",
    );
    expect(container.innerHTML).toBe("<ul><li>a</li><li>b</li></ul>");
    expect(root.firstChild).toBe(first);
  });

  it("rejects mixing keyed and unkeyed siblings", () => {
    const container = document.createElement("div");
    render(list(["a"]), container);

    expect(() => render(h("ul", {}, [
      h("li", {}, ["a"], "a"),
      h("li", {}, ["unkeyed"]),
    ]), container)).toThrow("Keyed child lists must give every child a key.");
  });

  it("validates keys on the initial mount as well", () => {
    const container = document.createElement("div");

    expect(() => render(list(["a", "a"]), container)).toThrow(
      "Duplicate child key: a.",
    );
    expect(container.childNodes).toHaveLength(0);
  });
});
