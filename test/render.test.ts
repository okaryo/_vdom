import { describe, expect, it, vi } from "vitest";

import { h, render, type TextVNode } from "../src";

describe("render", () => {
  it("mounts and returns the first root DOM node for a container", () => {
    const vnode = h("section", { id: "introduction" }, ["Virtual DOM"]);
    const container = document.createElement("div");

    const node = render(vnode, container);

    expect(container.innerHTML).toBe(
      '<section id="introduction">Virtual DOM</section>',
    );
    expect(container.firstChild).toBe(node);
  });

  it("adds the first child while preserving the root DOM node", () => {
    const firstVNode = h("ul", {}, []);
    const nextVNode = h("ul", {}, [h("li", {}, ["new child"])]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<ul><li>new child</li></ul>");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.firstChild?.nodeName).toBe("LI");
  });

  it("removes the only child while preserving the root DOM node", () => {
    const firstVNode = h("ul", {}, [h("li", {}, ["old child"])]);
    const nextVNode = h("ul", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const childNode = firstNode.firstChild;

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<ul></ul>");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(childNode?.parentNode).toBeNull();
  });

  it("replaces the root when the VNode kind changes", () => {
    const firstVNode: TextVNode = {
      type: "text",
      value: "Loading",
    };
    const nextVNode = h("section", {}, ["Loaded"]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<section>Loaded</section>");
    expect(nextNode).not.toBe(firstNode);
    expect(container.firstChild).toBe(nextNode);
    expect(firstNode.parentNode).toBeNull();
  });

  it("replaces an element when its tag name changes", () => {
    const firstVNode = h("p", {}, ["content"]);
    const nextVNode = h("section", {}, ["content"]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe("<section>content</section>");
    expect(nextNode).not.toBe(firstNode);
    expect(container.firstChild).toBe(nextNode);
    expect(firstNode.parentNode).toBeNull();
  });

  it("updates a compatible text node while preserving its identity", () => {
    const firstVNode: TextVNode = {
      type: "text",
      value: "Loading",
    };
    const nextVNode: TextVNode = {
      type: "text",
      value: "Loaded",
    };
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.textContent).toBe("Loaded");
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
    expect(firstNode.nodeValue).toBe("Loaded");
  });

  it("reuses a compatible empty element without changing the DOM", () => {
    const firstVNode = h("section", { id: "introduction" }, []);
    const nextVNode = h("section", { id: "introduction" }, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe(
      '<section id="introduction"></section>',
    );
    expect(nextNode).toBe(firstNode);
    expect(container.firstChild).toBe(firstNode);
  });

  it("recursively reconciles nested children by position", () => {
    const firstVNode = h("ul", {}, [
      h("li", { "data-id": "first" }, ["First"]),
      h("li", { "data-id": "second" }, ["Second"]),
    ]);
    const nextVNode = h("ul", {}, [
      h("li", { "data-id": "first" }, ["First updated"]),
      h("li", { "data-id": "second" }, ["Second"]),
      h("li", { "data-id": "third" }, ["Third"]),
    ]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const firstItem = firstNode.childNodes.item(0);
    const firstText = firstItem?.firstChild;
    const secondItem = firstNode.childNodes.item(1);

    const nextNode = render(nextVNode, container);

    expect(container.innerHTML).toBe(
      '<ul><li data-id="first">First updated</li><li data-id="second">Second</li><li data-id="third">Third</li></ul>',
    );
    expect(nextNode).toBe(firstNode);
    expect(nextNode.childNodes.item(0)).toBe(firstItem);
    expect(firstItem?.firstChild).toBe(firstText);
    expect(nextNode.childNodes.item(1)).toBe(secondItem);
    expect(nextNode.childNodes.item(2).textContent).toBe("Third");
  });

  it("matches children by position instead of moving a later node", () => {
    const firstVNode = h("div", {}, [
      h("p", {}, ["remove"]),
      h("button", {}, ["keep"]),
    ]);
    const nextVNode = h("div", {}, [h("button", {}, ["keep"])]);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const oldButton = firstNode.childNodes.item(1);

    const nextNode = render(nextVNode, container);
    const nextButton = nextNode.firstChild;

    expect(container.innerHTML).toBe("<div><button>keep</button></div>");
    expect(nextNode).toBe(firstNode);
    expect(nextButton).not.toBe(oldButton);
    expect(oldButton.parentNode).toBeNull();
  });

  it("adds, updates, and removes string attributes on a reused element", () => {
    const handleClick = vi.fn<(event: Event) => void>();
    const firstVNode = h(
      "button",
      {
        id: "before",
        title: "remove me",
        onClick: handleClick,
      },
      ["Save"],
    );
    const nextVNode = h(
      "button",
      {
        id: "after",
        "data-state": "ready",
        onClick: handleClick,
      },
      ["Save"],
    );
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);

    const nextNode = render(nextVNode, container);
    const button = container.querySelector("button");
    button?.dispatchEvent(new MouseEvent("click"));

    expect(nextNode).toBe(firstNode);
    expect(button?.getAttribute("id")).toBe("after");
    expect(button?.getAttribute("data-state")).toBe("ready");
    expect(button?.hasAttribute("title")).toBe(false);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("sets, restores, and clears an input value DOM property", () => {
    const firstVNode = h("input", { value: "initial" }, []);
    const updatedVNode = h("input", { value: "updated" }, []);
    const withoutValueVNode = h("input", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const input = container.querySelector("input");

    expect(input?.value).toBe("initial");
    expect(input?.hasAttribute("value")).toBe(false);

    const updatedNode = render(updatedVNode, container);
    expect(input?.value).toBe("updated");

    if (input !== null) {
      input.value = "user edit";
    }

    const restoredNode = render(updatedVNode, container);
    expect(input?.value).toBe("updated");

    const clearedNode = render(withoutValueVNode, container);
    expect(input?.value).toBe("");
    expect(updatedNode).toBe(firstNode);
    expect(restoredNode).toBe(firstNode);
    expect(clearedNode).toBe(firstNode);
  });

  it("sets, restores, and clears an input checked DOM property", () => {
    const firstVNode = h("input", { checked: false }, []);
    const checkedVNode = h("input", { checked: true }, []);
    const withoutCheckedVNode = h("input", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const input = container.querySelector("input");

    expect(input?.checked).toBe(false);
    expect(input?.hasAttribute("checked")).toBe(false);

    const checkedNode = render(checkedVNode, container);
    expect(input?.checked).toBe(true);

    if (input !== null) {
      input.checked = false;
    }

    const restoredNode = render(checkedVNode, container);
    expect(input?.checked).toBe(true);

    const clearedNode = render(withoutCheckedVNode, container);
    expect(input?.checked).toBe(false);
    expect(checkedNode).toBe(firstNode);
    expect(restoredNode).toBe(firstNode);
    expect(clearedNode).toBe(firstNode);
  });

  it("maps className updates to the class HTML attribute", () => {
    const firstVNode = h("section", { className: "pending" }, []);
    const updatedVNode = h("section", { className: "ready" }, []);
    const withoutClassVNode = h("section", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const section = container.querySelector("section");

    expect(section?.getAttribute("class")).toBe("pending");
    expect(section?.hasAttribute("classname")).toBe(false);

    const updatedNode = render(updatedVNode, container);
    expect(section?.getAttribute("class")).toBe("ready");

    const clearedNode = render(withoutClassVNode, container);
    expect(section?.hasAttribute("class")).toBe(false);
    expect(updatedNode).toBe(firstNode);
    expect(clearedNode).toBe(firstNode);
  });

  it("adds, updates, and removes styles on a reused element", () => {
    const firstVNode = h(
      "section",
      {
        style: {
          color: "red",
          backgroundColor: "black",
        },
      },
      [],
    );
    const updatedVNode = h(
      "section",
      {
        style: {
          color: "blue",
          borderColor: "white",
        },
      },
      [],
    );
    const withoutStyleVNode = h("section", {}, []);
    const container = document.createElement("div");
    const firstNode = render(firstVNode, container);
    const section = container.querySelector("section");

    const updatedNode = render(updatedVNode, container);
    expect(section?.style.color).toBe("blue");
    expect(section?.style.backgroundColor).toBe("");
    expect(section?.style.borderColor).toBe("white");

    const clearedNode = render(withoutStyleVNode, container);
    expect(section?.style.color).toBe("");
    expect(section?.style.borderColor).toBe("");
    expect(updatedNode).toBe(firstNode);
    expect(clearedNode).toBe(firstNode);
  });

  it("adds, replaces, and removes an event listener without accumulating handlers", () => {
    const firstHandler = vi.fn<(event: Event) => void>();
    const secondHandler = vi.fn<(event: Event) => void>();
    const withoutHandlerVNode = h("button", {}, ["Save"]);
    const firstHandlerVNode = h(
      "button",
      { onClick: firstHandler },
      ["Save"],
    );
    const secondHandlerVNode = h(
      "button",
      { onClick: secondHandler },
      ["Save"],
    );
    const container = document.createElement("div");
    const firstNode = render(withoutHandlerVNode, container);
    const button = container.querySelector("button");

    const addedNode = render(firstHandlerVNode, container);
    button?.dispatchEvent(new MouseEvent("click"));
    expect(firstHandler).toHaveBeenCalledOnce();

    const replacedNode = render(secondHandlerVNode, container);
    button?.dispatchEvent(new MouseEvent("click"));
    expect(firstHandler).toHaveBeenCalledOnce();
    expect(secondHandler).toHaveBeenCalledOnce();

    const removedNode = render(withoutHandlerVNode, container);
    button?.dispatchEvent(new MouseEvent("click"));
    expect(firstHandler).toHaveBeenCalledOnce();
    expect(secondHandler).toHaveBeenCalledOnce();
    expect(addedNode).toBe(firstNode);
    expect(replacedNode).toBe(firstNode);
    expect(removedNode).toBe(firstNode);
  });
});
