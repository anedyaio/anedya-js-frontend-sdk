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
    format: ["iife"],               // IIFE format is required for CDN script tags
    globalName: "Anedya",           // The variable name attached to the window object (e.g., window.Anedya)
    minify: true,                   // Minify the bundle heavily for performance
    sourcemap: true,
    treeshake: true,
    splitting: false,
    outExtension() {
      return {
        js: ".min.js",              // Forces the output file name to be 'anedya.min.js'
      };
    },
  },
]);