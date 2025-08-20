import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],  // Single entry point
  format: ["cjs", "esm"],
  dts: true,
  sourcemap: true, // Add sourcemap for debugging
  clean: true,
  treeshake: true,          // Remove unused code
  minify: true,             // Minify output
  splitting: false,         // Avoid splitting for SDKs
});
