# Portfolio Site — Design Spec

- **Date:** 2026-11-12
- **Status:** Draft — awaiting owner review
- **Scope:** Architecture and design for the MVP (Phase 1) plus the roadmap for later phases.

---

## 1. Purpose

A personal portfolio that is also the owner's first practical DevOps project.

It must:

1. Introduce the owner honestly: an IT student working toward a DevOps career, **not** an experienced DevOps engineer.
2. Publish a daily **learning journal** with minimal friction (add one Markdown file, nothing else).
3. Show an honest **learning roadmap** (status labels, never percentages or skill bars).
4. Showcase **projects** with real documentation (placeholders until real projects exist).
5. Provide a **resume** and professional contact links.
6. Over time, demonstrate DevOps practice: Git workflow, CI/CD, deployment, monitoring, possibly IaC.

**Audience:** internship recruiters and the owner (as a study record).
**Deadline driver:** internship starts 2027-01-18. MVP target: live by mid-December 2026.

### Non-goals

- No backend, database, CMS, user accounts, or server-side code.
- No skill percentages, proficiency bars, fake terminal animations, heavy gradients, or glassmorphism.
- No invented projects, credentials, or accomplishments.
- No home address, phone number, or school-history section.

---

## 2. Technology decisions

| Technology | Role | Decision |
|---|---|---|
| Astro (current stable) | Static site generator | Use. Ships zero client JS by default; content collections fit the journal. |
| TypeScript | Content schemas, config | Use lightly — mainly for schema validation and `site.config.ts`. |
| Tailwind CSS | Styling | Use. Design tokens defined once (colours, fonts, spacing). |
| Markdown | Content format | **Plain Markdown only.** MDX deferred until a real need appears. |
| Git + GitHub | Version control | Feature-branch workflow from the first change. Repo: `e-roz/personal-portfolio`. |
| GitHub Actions | CI/CD | Phase 4. The workflow builds, validates, **and deploys** (we do not use Cloudflare's Git auto-build). |
| Cloudflare | Hosting | Pages vs. Workers static assets to be confirmed at milestone 1.3 against current Cloudflare guidance. |

**Deliberately excluded for now:** linters, unit-test frameworks, MDX, search, pagination, analytics, Docker, Terraform. Each is added only when it solves a present problem (see §8).

**Quality gates in Phase 1:** `astro check` (types + content schemas) and a successful `astro build`.

---

## 3. Architecture

```
Markdown files ──► Astro content collections (schema-validated) ──► static HTML/CSS ──► Cloudflare CDN
```

Everything is generated at build time. There is no runtime server, so the production surface is static files only.

### Folder structure

```
personal-portfolio/
├─ .github/workflows/              # Phase 4
├─ docs/
│  ├─ design/                      # this spec and later design docs
│  └─ (architecture.md, deployment.md — added in Phases 2–3)
├─ templates/
│  └─ journal-entry.md             # copy-me template for new entries
├─ public/
│  ├─ resume.pdf                   # added when provided
│  ├─ favicon.svg
│  └─ robots.txt
├─ src/
│  ├─ site.config.ts               # name, email, GitHub, LinkedIn — single source of truth
│  ├─ content.config.ts            # collection schemas
│  ├─ content/
│  │  ├─ journal/                  # YYYY-MM-DD-slug.md
│  │  ├─ projects/                 # slug.md
│  │  └─ learning/                 # topic-id.md
│  ├─ layouts/
│  │  └─ BaseLayout.astro          # <head>, header, footer, theme handling
│  ├─ components/                  # Header, Footer, ThemeToggle, StatusChip, TopicTag, EntryRow, PlaceholderBadge
│  ├─ pages/
│  │  ├─ index.astro               # /
│  │  ├─ projects/index.astro      # /projects
│  │  ├─ projects/[slug].astro     # /projects/<slug>
│  │  ├─ journal/index.astro       # /journal
│  │  ├─ journal/[slug].astro      # /journal/<slug>
│  │  ├─ journal/topics/[topic].astro  # /journal/topics/<topic>
│  │  ├─ learning.astro            # /learning
│  │  ├─ contact.astro             # /contact (resume + links)
│  │  └─ 404.astro
│  └─ styles/global.css             # Tailwind entry + design tokens
├─ .gitattributes                   # normalise line endings (Windows dev, Linux CI)
├─ .gitignore
├─ astro.config.mjs
├─ package.json / package-lock.json # lockfile committed
├─ tsconfig.json
├─ LICENSE                          # MIT — covers code
└─ README.md
```

Components stay small and single-purpose. Pages query collections; components only render what they are given.

---

## 4. Content model

### 4.1 Topics (shared vocabulary)

A single list of topic IDs is defined in `content.config.ts` and used by both journal entries and learning topics:

`linux`, `git`, `networking`, `bash`, `docker`, `cicd`, `cloud`, `kubernetes`, `terraform`, `general`

An unknown topic **fails the build**. Adding a new topic = adding one ID to this list and one file in `content/learning/`.

### 4.2 Journal entry

File: `src/content/journal/YYYY-MM-DD-short-slug.md` (lowercase, hyphens only — Linux CI is case-sensitive).

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | yes | |
| `date` | date | yes | `YYYY-MM-DD`; drives sorting |
| `topic` | topic ID | yes | links the entry to a learning topic |
| `summary` | string | yes | one line; shown in lists |
| `tags` | string[] | no | free-form keywords |
| `draft` | boolean | no, default `false` | drafts are excluded from production builds |
| `references` | `{ title, url }[]` | no | rendered as a list at the end |

Body uses these headings (from the template). Sections may be omitted when empty:

```
## Concepts learned
## Hands-on exercises
## Commands
## Problems encountered
## Solutions and troubleshooting
## Key takeaways
```

### 4.3 Learning topic

File: `src/content/learning/<topic-id>.md`

| Field | Type | Required | Notes |
|---|---|---|---|
| `topic` | topic ID | yes | must match filename |
| `name` | string | yes | display name, e.g. "Git & GitHub" |
| `status` | `not-started` \| `learning` \| `practicing` \| `completed` | yes | no other values allowed |
| `studying` | string | yes | what is being studied now / planned |
| `exercises` | string[] | no | practical exercises completed; count shown on the page |
| `projects` | project slugs | no | related projects |
| `order` | number | yes | display order on the roadmap |

Related journal entries are **not** listed manually — they are found automatically by matching `topic`.

### 4.4 Project

File: `src/content/projects/<slug>.md`

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | |
| `summary` | string | yes | short description |
| `technologies` | string[] | yes | |
| `problem` | string | yes | problem being addressed |
| `repo` | URL | no | GitHub repository |
| `demo` | URL | no | live demo, when available |
| `placeholder` | boolean | no, default `false` | shows a dashed "Placeholder" badge |
| `order` | number | yes | display order |

Body holds: implementation details, what I learned, and documentation/README content.

### 4.5 Site config

`src/site.config.ts` holds: display name, short intro, "currently" topics, email, GitHub URL, LinkedIn URL, resume path. All start as clearly marked placeholders (e.g. `[Your Name]`) until the owner provides real values.

---

## 5. Pages

| Route | Content |
|---|---|
| `/` | Intro (2–3 sentences), "currently:" line, 3 most recent journal entries, compact learning summary with chips, first 2 projects by `order` |
| `/journal` | All published entries, newest first, with topic tags; links to topic pages |
| `/journal/<slug>` | Entry with date, topic, tags, body, references, prev/next links |
| `/journal/topics/<topic>` | Entries for one topic |
| `/learning` | Status legend + one block per topic: name, status chip, what I'm studying, exercise count, link to related entries, related projects |
| `/projects` | Project list with technologies and placeholder badges |
| `/projects/<slug>` | Full project write-up, repo/demo links |
| `/contact` | Resume (view/download), email, GitHub, LinkedIn |
| `/404` | Simple not-found page with link home |

---

## 6. Visual design

Approved direction: **"Technical document" (A) with status chips (from B) on the Learning page.**

- **Layout:** top navigation bar; single reading column, max width ~70 characters; generous vertical rhythm. No sidebar.
- **Typography:** clean sans-serif for text (candidate: Inter), monospace for metadata — dates, tags, "currently" line (candidate: JetBrains Mono). Final fonts chosen in milestone 1.2; self-hosted, no third-party font CDN at runtime.
- **Colour:** near-monochrome neutrals + one accent (teal; brighter variant in dark mode).
- **Status chips:** used on `/learning` and the home page's learning summary only. Each chip = dot + **text label** (never colour alone):
  not started (grey), learning (blue), practicing (amber), completed (green).
- **Placeholder badge:** dashed outline, uppercase "Placeholder".
- **Themes:** light and dark. Default follows the OS setting (`prefers-color-scheme`); a toggle overrides it and remembers the choice in `localStorage` (the only client-side JS in the MVP).
- **Motion:** none beyond subtle hover/focus transitions; respects `prefers-reduced-motion`.
- **Accessibility:** WCAG AA contrast in both themes, visible focus styles, semantic HTML (one `<h1>` per page, landmarks, labelled toggle), keyboard-navigable.
- **Responsive:** single column works naturally from 360px phones up; nav collapses to a simple wrapped row on small screens (no hamburger JS unless needed).

---

## 7. Error handling and safeguards

| Risk | Safeguard |
|---|---|
| Malformed entry (bad date, unknown topic, missing title) | Schema validation fails the build with a message naming the file and field. |
| Draft published by mistake | `draft: true` entries excluded from production builds. |
| Placeholder content goes live at launch | Phase 4 CI step fails if any project has `placeholder: true` or `site.config.ts` still contains `[Your …]` values (enabled at launch time). |
| Filename case / line endings differ between Windows and Linux CI | Lowercase-hyphen naming rule; `.gitattributes` normalises line endings. |
| Personal data leaks via resume | Owner checks resume content and PDF metadata before adding it. |
| Secrets exposure | Cloudflare token stored only in GitHub Actions secrets, minimum permissions; `.env*` git-ignored; never committed. |
| Broken links | Link checker added in Phase 5. |

---

## 8. Roadmap

Each milestone ends with: checks run → results reported → owner review → owner approval before the next one. **No commit or push without explicit owner approval.**

### Phase 1 — Foundation (MVP), on feature branches from the first change

| Milestone | Scope | Owner hands-on task |
|---|---|---|
| 1.1 | Create Astro project, add Tailwind + TypeScript config, `.gitattributes`, fix README; explain every generated file | Run the setup commands; first feature-branch commit |
| 1.2 | Base layout, header/footer, design tokens, light/dark theme, home page with placeholder content | Adjust tokens/copy |
| 1.3 | Manually deploy the skeleton to Cloudflare | Create the Cloudflare account; run the first deploy |
| 1.4 | Journal: schemas, template, list page, entry pages, topic pages | Write the first real journal entry; write `new-entry.sh` Bash script |
| 1.5 | Learning page, Projects (placeholders), Contact + resume, 404 | Provide real personal details and resume |

### Phase 2 — Version control (continues alongside Phase 1)
README with setup/structure/workflow, `docs/architecture.md`, branch protection on `main`, content license note (code MIT, content © owner).

### Phase 3 — Deployment
Confirm Cloudflare product, document the deploy procedure in `docs/deployment.md`, custom domain if available.

### Phase 4 — CI/CD
GitHub Actions: on pull request → `astro check` + build; on merge to `main` → build + deploy. Prettier formatting check. Placeholder guard (§7).

### Phase 5 — Reliability
Uptime monitor, post-deploy smoke check (home page returns 200), Lighthouse CI for performance/accessibility, link checker, `docs/operations.md`.

### Phase 6 — Infrastructure as Code
Evaluate Terraform's Cloudflare provider for DNS and project settings. Adopt only if it adds learning value; document the decision either way.

### Deferred features (add when needed)
- **Search** (Pagefind, build-time index) — when the journal reaches ~20+ entries.
- **Pagination** (Astro `paginate()`) — same trigger.
- **MDX** — when an entry genuinely needs an embedded component.
- **RSS feed** — optional, low effort, after MVP.

---

## 9. MVP definition of done

- [ ] All pages in §5 render, responsive at phone/tablet/desktop widths, in light and dark themes.
- [ ] New journal entry published by adding one file — no component edits.
- [ ] Invalid frontmatter fails `astro check` / build with a clear error.
- [ ] Learning page shows honest statuses and automatically links related entries.
- [ ] No invented personal information; every placeholder is visibly marked.
- [ ] Site deployed and reachable on Cloudflare.
- [ ] README explains how to run, build, and add an entry.
- [ ] Owner can explain the purpose of every file in `src/`.

---

## 10. Open items (do not block milestone 1.1)

- Owner's display name, professional email, LinkedIn URL, resume PDF — needed at milestone 1.5.
- Custom domain — needed at Phase 3; site works on the Cloudflare-provided subdomain until then.
- Final font choice — milestone 1.2.
