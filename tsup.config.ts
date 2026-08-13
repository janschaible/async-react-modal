import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/react.tsx"],
  format: ["esm"],
  dts: true,
  clean: true,
  external: ["react"],
});
