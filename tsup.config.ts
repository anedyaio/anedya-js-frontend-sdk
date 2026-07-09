import { defineConfig } from "tsup";

export default defineConfig([
  // 1. Core Build for Node/Bundlers (NPM package)
  {
    entry: {
      anedya: "src/index.ts"
    },
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: true,
    splitting: false,
  },

  // 2. Production CDN Build (Direct Browser/Script Tag usage)
  {
    entry: {
      anedya: "src/index.ts"
    },
    format: ["iife"],
    globalName: "Anedya",
    minify: true,
    sourcemap: true,
    treeshake: true,
    splitting: false,
    noExternal: [/.*/],
    platform: "browser", // <-- CRITICAL: Forces esbuild to target browser mechanics
    target: "es2020",    // <-- CRITICAL: Compiles code to clean browser-supported ECMA standard
    outExtension() {
      return {
        js: ".min.js",
      };
    },
  },
]);