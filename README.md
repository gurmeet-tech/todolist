# Todo

A keyboard-friendly todo list built with React + Vite, styled on Vercel's
[Geist](design.md) system. Task completion uses the animated `SpringCheck`
component from [React Bits](https://reactbits.dev).

## Features

- Add, inline-edit (Enter to save, Esc to cancel), and delete tasks
- Spring-animated completion checkbox (`SpringCheck`)
- Filters: All / Active / Done
- Live search, mark-all-done, active/done counts, clear completed
- Persists to `localStorage`
- Plain `#fafafa` canvas, Geist Sans / Geist Mono, hairline borders

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview the production build |

## Project structure

```
src/
  App.jsx                 todo UI + state
  App.css
  index.css               Geist design tokens
  components/
    SpringCheck.jsx/.css  React Bits component
    TodoItem.jsx          task row
    Icon.jsx              Hugeicons SVG renderer
  hooks/
    useLocalStorage.js
```

## Dependencies

- [react](https://react.dev) / [vite](https://vitejs.dev)
- [motion](https://motion.dev)
- [@hugeicons/core-free-icons](https://hugeicons.com)
