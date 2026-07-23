export type StateCell<Value> = {
  get(): Value;
  set(nextValue: Value): void;
};

export function createState<Value>(initialValue: Value): StateCell<Value> {
  let value = initialValue;

  return {
    get() {
      return value;
    },
    set(nextValue) {
      value = nextValue;
    },
  };
}
