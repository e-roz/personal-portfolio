# personal-portfolio

My personal portfolio and DevOps learning journal, built with Astro.

> **Status:** early development — milestone 1.1 (project setup).

## Requirements

- Node.js 22.23.4 or newer (even-numbered versions only)
- npm

## Getting started

```bash
npm install       # install exact dependency versions from package-lock.json
npm run dev       # start the dev server at http://localhost:4321
```

## Commands

| Command           | What it does                                |
| ----------------- | ------------------------------------------- |
| `npm run dev`     | Start the local development server          |
| `npm run check`   | Type-check `.astro` and `.ts` files         |
| `npm run build`   | Build the production site into `dist/`      |
| `npm run preview` | Serve the built `dist/` folder locally      |

## Project structure

```text
├─ docs/            design spec and implementation plans
├─ public/          static files copied as-is (robots.txt)
├─ src/
│  ├─ pages/        each file becomes a page (index.astro → /)
│  └─ styles/       global CSS and Tailwind entry point
├─ astro.config.mjs Astro configuration
└─ tsconfig.json    TypeScript configuration
```

## License

Code is licensed under the MIT License (see `LICENSE`).
