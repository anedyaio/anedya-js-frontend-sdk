import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // npm link / file: deps are symlinks — without this Vite can resolve
    // duplicate copies of React (one inside the linked package, one here)
    preserveSymlinks: true,
  },
  server: {
    fs: {
      // allow Vite to read outside the project root, since a linked/file:
      // package's real files live in your SDK repo, not in node_modules
      allow: [".."],
    },
  },
});
