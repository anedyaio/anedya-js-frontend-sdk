# Anedya Stream SDK — React Demo

A minimal React + TypeScript port of the HTML stream demo, used to show
`AnedyaStreamClient` working from a real React app rather than a `<script>`
tag global.

## What's simplified vs. the HTML demo

- Subscription inputs are disabled until the stream is connected (the HTML
  demo let you queue subs before connecting and wired them on `connect()`).
  Not worth the extra state for a basic demo — add it back if you need it.
- No flash/highlight animation on stat updates — just plain re-renders.
- Same sandbox node/stream credentials as the HTML demo, in `src/config.ts`.
  Swap them if you're pointing this at something else.

Everything else (stats grid, subscription list with pause/cancel, global
pause, scrolling event log) matches the original.

## Wiring up your local SDK package

This project depends on `@anedyasystems/anedya-frontend-sdk` as a **local**
package rather than something published to npm. Pick one of:

### Option A — `file:` dependency (what's in `package.json` now)

```json
"@anedyasystems/anedya-frontend-sdk": "file:../anedya-frontend-sdk"
```

This assumes your SDK repo lives one directory up from this project, at
`../anedya-frontend-sdk`. **Change the path** to wherever it actually is,
then run:

```bash
npm install
```

### Option B — `npm link`

From your SDK repo (with a build already produced — `dist/` must exist and
match whatever `main`/`module`/`types` point to in its `package.json`):

```bash
npm link
```

Then from this project:

```bash
npm link @anedyasystems/anedya-frontend-sdk
npm install
```

## Running it

```bash
npm install
npm run dev
```

## If Vite can't find your changes or throws weird duplicate-React errors

Local `file:`/`link`ed packages are symlinks, and Vite's dependency
optimizer + module resolution can get confused by that in two specific ways
— both already handled in `vite.config.ts`:

- **Duplicate React instances** ("Invalid hook call" errors) — happens when
  Vite resolves React from inside the linked package's own
  `node_modules` instead of this project's. `resolve.preserveSymlinks: true`
  fixes this.
- **"outside of Vite serving allow list"** errors — happens because the
  linked package's real files live outside this project's root.
  `server.fs.allow: ['..']` fixes this.

If you rebuild your SDK and the demo doesn't pick up the change, it's
usually Vite's dependency cache being stale:

```bash
rm -rf node_modules/.vite
npm run dev -- --force
```
