import { describe, expect, it } from "vitest";

import { h, render, useState, type FunctionComponent } from "../src";

const ItemCounter: FunctionComponent<{ label: string }> = ({ label }) => {
  const [count, setCount] = useState(0);

  return h("button", { onClick: () => setCount(count + 1) }, [
    `${label}: ${count}`,
  ]);
};

type KeyMode = "stable-id" | "unkeyed" | "index";

function counterList(labels: string[], mode: KeyMode) {
  return h("div", {}, labels.map((label, index) => {
    const key = mode === "stable-id"
      ? label
      : mode === "index" ? index : undefined;

    return h(ItemCounter, { label }, [], key);
  }));
}

describe("component state across list reordering", () => {
  it("moves state and DOM identity with a stable component key", () => {
    const container = document.createElement("div");
    const root = render(counterList(["a", "b"], "stable-id"), container);
    const [aButton, bButton] = Array.from(root.childNodes);
    const aText = aButton.firstChild;

    aButton.dispatchEvent(new MouseEvent("click"));

    expect(container.innerHTML).toBe(
      "<div><button>a: 1</button><button>b: 0</button></div>",
    );

    render(counterList(["b", "a"], "stable-id"), container);

    expect(container.innerHTML).toBe(
      "<div><button>b: 0</button><button>a: 1</button></div>",
    );
    expect(container.firstChild).toBe(root);
    expect(root.childNodes.item(0)).toBe(bButton);
    expect(root.childNodes.item(1)).toBe(aButton);
    expect(aButton.firstChild).toBe(aText);

    aButton.dispatchEvent(new MouseEvent("click"));

    expect(container.innerHTML).toBe(
      "<div><button>b: 0</button><button>a: 2</button></div>",
    );
    expect(root.childNodes.item(1)).toBe(aButton);
  });

  it.each(["unkeyed", "index"] as const)(
    "keeps state and DOM identity at the same position with %s matching",
    (mode) => {
      const container = document.createElement("div");
      const root = render(counterList(["a", "b"], mode), container);
      const [firstButton, secondButton] = Array.from(root.childNodes);
      const firstText = firstButton.firstChild;

      firstButton.dispatchEvent(new MouseEvent("click"));

      expect(container.innerHTML).toBe(
        "<div><button>a: 1</button><button>b: 0</button></div>",
      );

      render(counterList(["b", "a"], mode), container);

      expect(container.innerHTML).toBe(
        "<div><button>b: 1</button><button>a: 0</button></div>",
      );
      expect(container.firstChild).toBe(root);
      expect(root.childNodes.item(0)).toBe(firstButton);
      expect(root.childNodes.item(1)).toBe(secondButton);
      expect(firstButton.firstChild).toBe(firstText);

      firstButton.dispatchEvent(new MouseEvent("click"));

      expect(container.innerHTML).toBe(
        "<div><button>b: 2</button><button>a: 0</button></div>",
      );
    },
  );
});
