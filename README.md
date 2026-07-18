# Devstopian Journal

Compose Markdown journal entries in your browser. Entries are stored **locally
in your browser** using IndexedDB — there is no server and no account. Your
journal never leaves your machine.

## Features

- ✍️ Write entries in **Markdown** with a live **Write / Preview** toggle
- 📚 Full **CRUD**: create, list, view, edit, and delete entries
- 💾 Persisted in the browser via **IndexedDB** (through [Dexie](https://dexie.org))
- 🔒 Markdown is sanitized with **DOMPurify** before rendering
- 🌗 Automatic light / dark theme

## Tech stack

- [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) + [Vite](https://vitejs.dev)
- [Dexie](https://dexie.org) + `dexie-react-hooks` for reactive IndexedDB storage
- [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

Type-check, build, and preview a production bundle:

```bash
npm run typecheck  # tsc --noEmit
npm run build      # type-check + build to dist/
npm run preview    # serve the built bundle locally
```

## Deployment (GitHub Pages)

Pushes to `main` build the app and publish it to GitHub Pages via
`.github/workflows/deploy-pages.yml`. The production build uses a base path of
`/driven-journal/`, so the site is served at:

```
https://joelvandiver.github.io/driven-journal/
```

**One-time setup:** in the repository's **Settings → Pages**, set **Source** to
**GitHub Actions**. After that, every push to `main` deploys automatically (you
can also trigger a run manually from the **Actions** tab).

## How it works

All entries live in an IndexedDB database named `driven-journal` in the browser.
Because storage is per-browser, entries you create in one browser (or profile)
won't appear in another. Clearing site data will remove your entries.

## Project structure

The app source lives under `docs/demo/` (the Vite root); tooling config sits at
the repository root.

```
docs/demo/
  index.html             # Vite entry HTML
  main.tsx               # React bootstrap
  db.ts                  # Dexie schema + typed CRUD helpers
  markdown.ts            # Markdown parsing + sanitization
  App.tsx                # Layout and view-state orchestration
  components/
    EntryList.tsx        # Sidebar list of entries
    EntryView.tsx        # Rendered entry + edit/delete actions
    EntryEditor.tsx      # Markdown editor with Write/Preview tabs
  styles.css
vite.config.ts           # Vite config (root = docs/demo, build → dist/)
tsconfig.json            # TypeScript config
```
