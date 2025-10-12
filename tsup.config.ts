import tsconfigPaths from "tsconfig-paths";
import { defineConfig } from "tsup";
import pkg from "./package.json";

tsconfigPaths.register();

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [...Object.keys(pkg.peerDependencies || {})],
});
