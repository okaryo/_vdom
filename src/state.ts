export type StateListener = () => void;

export type StateCell<Value> = {
  get(): Value;
  set(nextValue: Value): void;
  subscribe(listener: StateListener): () => void;
};

export function createState<Value>(initialValue: Value): StateCell<Value> {
  let value = initialValue;
  const listeners = new Set<StateListener>();

  return {
    get() {
      return value;
    },
    set(nextValue) {
      value = nextValue;

      for (const listener of [...listeners]) {
        listener();
      }
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
