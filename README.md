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

- [React 19](https://react.dev) + [Vite](https://vitejs.dev)
- [Dexie](https://dexie.org) + `dexie-react-hooks` for reactive IndexedDB storage
- [marked](https://marked.js.org) + [DOMPurify](https://github.com/cure53/DOMPurify)

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
```

Build a production bundle:

```bash
npm run build
npm run preview  # serve the built bundle locally
```

## How it works

All entries live in an IndexedDB database named `driven-journal` in the browser.
Because storage is per-browser, entries you create in one browser (or profile)
won't appear in another. Clearing site data will remove your entries.

## Project structure

```
src/
  db.js                  # Dexie schema + CRUD helpers
  markdown.js            # Markdown parsing + sanitization
  App.jsx                # Layout and view-state orchestration
  components/
    EntryList.jsx        # Sidebar list of entries
    EntryView.jsx        # Rendered entry + edit/delete actions
    EntryEditor.jsx      # Markdown editor with Write/Preview tabs
  styles.css
```
