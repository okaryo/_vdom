import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    // Match TypeScript's classic emit without injecting JSX debug props.
    jsx: { development: false },
  },
  test: {
    environment: "jsdom",
  },
});
