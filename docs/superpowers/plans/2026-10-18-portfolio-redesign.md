# Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild phani92.github.io in the approved "Bold and modern" (option C) look, with hand-picked projects, a featured blogBot tile with a live strip, contact links in the nav, and a matching blog page.

**Architecture:** This is a static site with no build step. `index.html` holds all homepage markup. The pure logic lives in small classic-script files that set browser globals and also `module.exports`, so the same file runs in the browser and under Node's built-in test runner: blog filename and date helpers, project filtering and tile HTML, and the mailto builder. Page scripts (`home.js`, `blogs.js`, `site.js`) wire that logic to the DOM. Project content is in `data/projects.json`. Blog content stays exactly where blogBot writes it.

**Tech Stack:** HTML, CSS (custom properties, grid, `clamp()`), vanilla JS (classic scripts, no modules, no bundler), Google Fonts Inter, `marked@12.0.2` from jsDelivr, Node ≥ 18 `node --test` for unit tests (no `package.json`, no npm), `cwebp`/`magick` for images, Playwright MCP browser tools for visual checks.

**Spec:** `docs/superpowers/specs/2026-10-18-portfolio-redesign-design.md`. Mockup: `docs/superpowers/specs/2026-10-18-portfolio-redesign-mockup.html`. Read both before starting any task.

## Global Constraints

- No framework, build step, bundler or package manager. Don't create a `package.json`.
- All asset paths are relative. Keep `CNAME`.
- Never modify anything in `blogs/` (it's written by blogBot automation). `blogs/blogList.json` stays a flat array of filenames, newest first.
- External resources: Google Fonts (Inter) and `https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js` only.
- **Palette:**
  - background `#0b0b12`
  - purple `#7c5cff`
  - cyan `#00c8ff`
  - live green `#3ddc97`
  - body text `#ffffff`
  - muted text `#a0a0b4`
  - card border `#23233a`
  - **Category colors:** embedded = cyan, AI = purple.
- Card radius 18–20px. Buttons and filter chips are pills (`border-radius: 999px`).
- **Name:** "Phani!", with the "!" in `#7c5cff`. Used in the nav, footer and `<title>`.
- **Hero copy:** pill "Embedded systems · AI automation", headline "From silicon" / "to smart agents." with the second line in the purple→cyan gradient, and a single button "See my work →".
- **Links:**
  - GitHub `https://github.com/phani92`
  - LinkedIn `https://www.linkedin.com/in/phanindra-kumar-yellapu`
  - Email `phanindra.yellapu@gmail.com`, mailto subject "Hello from your portfolio".
- **Removed, with no references left anywhere:** EmailJS, `api.github.com`, Orbitron, the profile photo, CV, hire-me. Don't make claims the spec doesn't support, such as years of experience, clients or certifications.
- **Layout:** no horizontal scroll at 360px. Use a 16px side gutter on phones. Respect `prefers-reduced-motion`, show visible focus states, and give images alt text.
- **Shared scripts:** each sets a single global (`BlogUtils`, `ProjectUtils`, `SiteUtils`) and ends with:
  `if (typeof module !== 'undefined') module.exports = <Global>;`

## Review Focus

1. **`blogs/blogList.json` or a post's Markdown fails to load, or is malformed.** The homepage still renders. The live strip is hidden, and the posts stat shows "—" rather than `NaN` or `undefined`. The blog page shows a short error message in place of the list. Tested in Task 1 (`countPosts` and `latestDiary` with bad input) and verified in Tasks 4 and 5.
2. **A blog URL hash that isn't a real post** (`#nope.md`, `#../index.html`, `#<img onerror=…>`). Fall back to the newest post, and never fetch arbitrary paths. Tested in Task 1 (`resolvePostFromHash`).
3. **Titles with Markdown or HTML in them** (`# **Bold** [link](u) <b>x</b>`). Show them as plain text in the strip; never inject them as HTML. Tested in Task 1 (`extractTitle`) and Task 4 (strip uses `textContent`).
4. **blogBot changes its filename scheme, so names match neither pattern.** Labels fall back to the name without `.md`. `latestDiary` returns `null` and the strip hides. Tested in Task 1.
5. **A project image fails to load, or a filter leaves an odd number of tiles.** The tile still shows its title and tag, with no broken-image icon, and the grid has no empty holes under All, Embedded or AI. Tested in Task 3 (`projectTileHTML` icon variant) and verified at three widths.

---

## File structure

| Path | Responsibility |
|---|---|
| `index.html` | All homepage markup: nav, hero, services, projects container, live strip, footer |
| `html/blogs.html` | Blog page markup: same nav and footer, sidebar list and post area |
| `css/base.css` | Tokens, reset, typography, buttons and pills, nav (including the phone menu), footer. Shared by both pages |
| `css/home.css` | Hero, services, bento grid and tiles, filter chips, live strip |
| `css/blog.css` | Blog layout, the list on phones, Markdown body styles |
| `js/site.js` | `SiteUtils`: mailto builder, email-link wiring, nav toggle. Shared by both pages |
| `js/blog-utils.js` | `BlogUtils`: pure filename, date, title and liveness helpers |
| `js/projects.js` | `ProjectUtils`: pure filtering and tile HTML (replaces the old GitHub API script) |
| `js/home.js` | Homepage wiring: load the JSON, render the grid and filters, fill the stats and live strip |
| `js/blogs.js` | Blog page wiring (rewritten): list, hash deep-link, rendering |
| `data/projects.json` | The 6 projects, in display order |
| `images/projects/` | Compressed project images |
| `tests/*.test.js` | `node --test` unit tests for the three utility files |

**To delete:**
- **CSS:** `css/style.css`, `css/profile.css`, `css/projects.css`, `css/contact.css`, `css/responsive.css`
- **JS:** `js/main.js`, `js/env.js`, `js/contact.js`
- **HTML:** `html/profile.html`, `html/projects.html`, `html/contact.html`
- **Images:** `images/profile-placeholder.jpg`, `images/in-logo/`, `images/github/`, `images/instagram/`
- **Folders:** `assets/` (holds only empty folders)

Unit tests run with: `node --test tests/`

---

### Task 1: Blog utilities

**Files:**
- Create: `js/blog-utils.js`, `tests/blog-utils.test.js`

**Interfaces:**
- Produces (global `BlogUtils`):
  - `parseBlogFile(name: string) -> { name, kind: 'diary'|'stock'|'other', date: Date|null, ticker: string|null }`
    - Diary files match `^Bots_diary_(\d{4})_(\d{2})_(\d{2})\.md$`.
    - Stock files match `^stock_([A-Za-z]+)_(\d{4})_(\d{2})_(\d{2})\.md$`.
    - `date` is local midnight: `new Date(y, m - 1, d)`.
  - `formatDate(date: Date) -> string`: `"6 Oct 2026"`. Use a fixed English month array, not `toLocaleDateString`.
  - `blogLabel(name: string) -> string`: `"Bot's diary · 6 Oct 2026"`, `"NVIDIA stock · 14 Apr 2025"`, otherwise the name without `.md`.
  - `latestDiary(files: unknown) -> string|null`: the first diary entry in list order. Returns `null` for a non-array or no match.
  - `countPosts(files: unknown) -> number|null`: the number of entries (rule: count every entry in the list). Returns `null` if it isn't an array.
  - `extractTitle(markdown: string) -> string|null`: the first line starting with `# `, with Markdown stripped (`**`, `*`, `_`, backticks, `[text](url)` → text) and HTML tags removed, then trimmed. Returns `null` if there is none.
  - `isLive(postDate: Date, now: Date, maxAgeDays = 3) -> boolean`: true when the difference in whole local calendar days is between 0 and `maxAgeDays`.
  - `resolvePostFromHash(hash: string, files: string[]) -> string|null`: strip a leading `#`, `decodeURIComponent` inside try/catch, then return it only if it appears exactly in `files`. Otherwise return `files[0]`, or `null` if `files` is empty.

- [ ] **Step 1: Write the failing tests** in `tests/blog-utils.test.js` using `node:test` and `node:assert/strict`, with `const B = require('../js/blog-utils.js')`:
  - `parseBlogFile('Bots_diary_2026_10_06.md')` → kind `'diary'`. The date has `getFullYear()` 2026, `getMonth()` 9 and `getDate()` 6.
  - `parseBlogFile('stock_NVIDIA_2025_04_14.md')` → kind `'stock'`, ticker `'NVIDIA'`.
  - `parseBlogFile('notes.md')` → kind `'other'`, date `null`.
  - `blogLabel('Bots_diary_2026_10_06.md') === "Bot's diary · 6 Oct 2026"`.
  - `blogLabel('stock_NVIDIA_2025_04_14.md') === 'NVIDIA stock · 14 Apr 2025'`.
  - `blogLabel('weekly_recap_v2.md') === 'weekly_recap_v2'`.
  - `latestDiary(['stock_NVIDIA_2025_04_14.md', 'Bots_diary_2026_10_06.md', 'Bots_diary_2026_10_03.md']) === 'Bots_diary_2026_10_06.md'`.
  - `latestDiary(['x.md'])`, `latestDiary(null)` and `latestDiary({})` are all `null`.
  - `countPosts(['a.md', 'b.md']) === 2`. `countPosts(undefined)` and `countPosts('oops')` are `null`.
  - `extractTitle('intro\n# The Binary Soul: An AI’s Late-Night Debate\nbody') === 'The Binary Soul: An AI’s Late-Night Debate'`.
  - `extractTitle('# **Bold** [link](http://x) <b>x</b> `code`') === 'Bold link x code'`.
  - `extractTitle('## only h2\ntext') === null`.
  - `isLive`, with the post on 6 Oct 2026 (`new Date(2026, 9, 6)`):
    - now `new Date(2026, 9, 9, 23, 0)` → `true`
    - now `new Date(2026, 9, 10, 0, 30)` → `false`
    - now `new Date(2026, 9, 18)` → `false`
    - post later than now → `false`
  - `resolvePostFromHash`, with `files = ['Bots_diary_2026_10_06.md', 'Bots_diary_2026_10_03.md']`:
    - `'#Bots_diary_2026_10_03.md'` → that file
    - `'#nope.md'`, `'#../index.html'`, `'#%E0%A4%A'` (malformed) and `''` → `'Bots_diary_2026_10_06.md'`
    - `resolvePostFromHash('#a', [])` → `null`

- [ ] **Step 2: Run `node --test tests/`.** Expected: FAIL, "Cannot find module '../js/blog-utils.js'".

- [ ] **Step 3: Implement `js/blog-utils.js`** with the interface above. It's a classic script: wrap it in an IIFE that assigns `window.BlogUtils` when `window` exists, and end with the `module.exports` line from Global Constraints.

- [ ] **Step 4: Run `node --test tests/`.** Expected: all pass.

- [ ] **Step 5: Commit**
```bash
git add js/blog-utils.js tests/blog-utils.test.js
git commit -m "Add blog filename, title and liveness utilities with tests"
```

---

### Task 2: Site shell (base styles, nav with contact, footer, hero, services) and removal of the old site

**Files:**
- Create: `css/base.css`, `css/home.css`, `js/site.js`, `tests/site.test.js`
- Rewrite: `index.html`
- Delete: every file in the "To delete" list above except `js/projects.js`, which Task 3 rewrites. Delete `js/projects.js` now too, so no old GitHub API code is left.

**Interfaces:**
- Produces (global `SiteUtils`):
  - `mailtoHref(user: string, domain: string, subject: string) -> string`. Returns `'mailto:' + user + '@' + domain + '?subject=' + encodeURIComponent(subject)`.
  - `initEmailLinks(doc: Document) -> void`. For every `[data-email-link]`, sets `href` to `mailtoHref('phanindra.yellapu', 'gmail.com', 'Hello from your portfolio')`. For every `[data-email-text]`, sets `textContent` to the address.
  - `initNav(doc: Document) -> void`. Clicking `#nav-toggle` toggles the class `is-open` on `#nav-links` and keeps `aria-expanded` in sync. Clicking a link inside `#nav-links` closes the menu.
  - On `DOMContentLoaded`, call both `init*` functions, guarded by `typeof document !== 'undefined'`.
- **Markup contract** (both pages use it; Task 5 copies the nav and footer):
  - `<header class="site-nav">` contains:
    - the name: `<a class="brand" href="…index.html">Phani<span class="brand-bang">!</span></a>`
    - `<button id="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Menu">`
    - `<nav id="nav-links">`, holding the Work, Services and Blog links
    - `<div class="nav-contact">` with GitHub and LinkedIn icon links (inline SVG, `aria-label`) and `<a class="pill pill-email" data-email-link href="https://www.linkedin.com/in/phanindra-kumar-yellapu">✉ <span class="pill-email-text">Email me</span></a>`. The LinkedIn `href` is the fallback when JavaScript is off.
  - `<footer class="site-footer">` holds "© 2026 Phani!", GitHub and LinkedIn text links, and `<span data-email-text></span>`.
  - Section ids: `#services`, `#work`, `#live`.

- [ ] **Step 1: Write the failing tests** in `tests/site.test.js`:
  - `mailtoHref('phanindra.yellapu', 'gmail.com', 'Hello from your portfolio') === 'mailto:phanindra.yellapu@gmail.com?subject=Hello%20from%20your%20portfolio'`
  - `initEmailLinks` with a minimal fake document. `querySelectorAll` returns two plain objects for `'[data-email-link]'` and one for `'[data-email-text]'`. Afterwards the links' `href` and the text node's `textContent === 'phanindra.yellapu@gmail.com'`.

- [ ] **Step 2: Run `node --test tests/`.** Expected: the site tests FAIL with module not found, and the Task 1 tests pass.

- [ ] **Step 3: Implement `js/site.js`** per the interface.

- [ ] **Step 4: Run `node --test tests/`.** Expected: all pass.

- [ ] **Step 5: Delete the old files** listed above. Then rewrite `index.html`:
  - `<title>Phani! · Embedded systems & AI automation</title>` and a meta description.
  - The Inter font link (weights 400, 600, 700, 800).
  - Links to `css/base.css` and `css/home.css`.
  - The nav and footer per the markup contract. Work → `#work`, Services → `#services`, Blog → `html/blogs.html` in the same tab.
  - The hero, with the exact copy from Global Constraints and a supporting sentence: "I write firmware for real hardware and build AI agents that do the work on their own, from first prototype to running in production."
  - `#services`, with two cards:
    - **Embedded systems** (cyan): "Firmware in C/C++, sensor integration, measurement and test rigs, microcontrollers."
    - **AI automation** (purple): "Agents and pipelines in Python that run on a schedule and publish results with no one involved."
  - An empty `<section id="work">` with heading "Projects", eyebrow "Selected work", a `<div class="filters" role="group">` placeholder and `<div id="project-grid"></div>`.
  - An empty `<section id="live" hidden>`.
  - Scripts at the end of `<body>`: `js/site.js`. Tasks 3 and 4 add more.

- [ ] **Step 6: Write `css/base.css` and `css/home.css`** for the nav, footer, hero and services. Match the mockup: the hero glows are radial gradients of `#7c5cff` at about 42% opacity (top right) and `#00c8ff` at about 22% (bottom left). The headline is `clamp(2.4rem, 7vw, 4rem)`, weight 800, letter-spacing −0.035em.
  - **Phones (≤ 720px):** `#nav-toggle` shows, and `#nav-links` becomes a dropdown shown when `.is-open`. `.nav-contact` stays visible. Services stack.
  - **≤ 380px:** `.pill-email-text` is visually hidden (keep it readable by screen readers), leaving the ✉ icon.

- [ ] **Step 7: Verify in a browser.** Run `python3 -m http.server 8000` in the background. Use the Playwright MCP tools to open `http://localhost:8000/` at 1280×800, 768×1024 and 360×740, taking a screenshot at each and comparing with the mockup.
  - At every width, `document.documentElement.scrollWidth <= window.innerWidth`.
  - The Email me `href` starts with `mailto:phanindra.yellapu@gmail.com?subject=`.
  - The menu button opens and closes the links at 360px.
  - The console has no errors.
  - `grep -rn "phanindra.yellapu@gmail.com" index.html` prints nothing.

- [ ] **Step 8: Commit**
```bash
git add -A index.html css js tests html images assets
git commit -m "Rebuild homepage shell in the new design and remove EmailJS and old sections"
```

---

### Task 3: Projects data, images and bento grid with filters

**Files:**
- Create: `data/projects.json`, `images/projects/*`, `js/projects.js`, `tests/projects.test.js`, `js/home.js`
- Modify: `index.html` (scripts), `css/home.css` (grid, tiles, chips)

**Interfaces:**
- Consumes: the `#work` markup from Task 2.
- Produces:
  - **The `data/projects.json` schema:** an array, in display order, of `{ id, title, category: 'ai'|'embedded', tech, summary, repo, image?: string, imageAlt?: string, icon?: 'chip'|'wave'|'flask', featured?: boolean, stats?: [{ label, value?: string, source?: 'blogPostCount' }] }`. `image` is relative to the site root (for example `images/projects/ultrasonic.webp`).
  - Global `ProjectUtils`:
    - `filterProjects(projects: Project[], category: 'all'|'embedded'|'ai') -> Project[]`, keeping order. An unknown category behaves as `'all'`.
    - `escapeHTML(s: string) -> string`.
    - `projectTileHTML(p: Project) -> string`. Returns a single `<a class="tile tile--{category}[ tile--featured]" href="{repo}" target="_blank" rel="noopener noreferrer">` with the tag line `"{CATEGORY} · {tech}"`, where category displays as `EMBEDDED` or `AI`.
      - **Featured:** adds a `FEATURED · ` prefix, the summary, and one `<div class="stat">` per stat with `<span class="stat-value" data-stat-source="{source}">{value or '—'}</span><span class="stat-label">`.
      - **With an image:** `<img src alt loading="lazy">`.
      - **Without an image:** a `<div class="tile-icon" data-icon="{icon}">` with an inline SVG.
      - Every interpolated value is escaped.
  - `js/home.js`: `renderProjects(category)` and filter-chip wiring. It exposes `window.Home = { projects }` after loading, so Task 4 can fill stats.

- [ ] **Step 1: Write the failing tests** in `tests/projects.test.js`, using a fixture of three projects (one featured AI, one embedded with an image, one embedded with an icon):
  - `filterProjects(list, 'embedded').map(p => p.id)` gives the two embedded ids in order.
  - `filterProjects(list, 'ai').length === 1`.
  - `filterProjects(list, 'bogus').length === 3`.
  - `projectTileHTML(featured)` contains `tile--featured`, `href="https://github.com/phani92/blogBot"`, `rel="noopener noreferrer"`, `data-stat-source="blogPostCount"` and `>—<` (a stat with no value).
  - `projectTileHTML(imageProject)` contains `loading="lazy"` and the `alt` text.
  - `projectTileHTML(iconProject)` contains `class="tile-icon"` and no `<img`.
  - `projectTileHTML({ ...iconProject, title: '<script>x</script>' })` does not contain `<script>`.

- [ ] **Step 2: Run `node --test tests/`.** Expected: the projects tests FAIL with module not found.

- [ ] **Step 3: Implement `js/projects.js`** per the interface.

- [ ] **Step 4: Run `node --test tests/`.** Expected: all pass.

- [ ] **Step 5: Prepare the images.** Download from `https://raw.githubusercontent.com/phani92/<repo>/<branch>/<path>` into the scratchpad. Convert each one to WebP at most 1000px wide, with a target under 150 KB, using `cwebp -q 78 -resize 1000 0` (or `magick`). Save them in `images/projects/`:
  - `ultrasonic.webp` from `ultrasonic-measurement-device`, branch `main`: `cad files/assembly-bild.PNG`. URL-encode the space.
  - `mate-service.webp` from `mate_service`, branch `main`: `screenshots/desktop.png`.
  - `pressure-sensor.webp` from `sick-pressure-sensor`, branch `master`: view `images/MSR-Pressure_Sensor-WS_2017.026.png`, `.035.png` and `.036.png` with the Read tool and choose the clearest photo or setup diagram.
  - Check with `ls -l images/projects`: three files, each under 150 KB.

- [ ] **Step 6: Write `data/projects.json`** with the six projects in this order:
  1. blogBot: featured, `ai`, `Python`. Summary: "An AI agent that pulls the day's news headlines, picks a random topic, format and tone, has Gemini write a post, and publishes it here daily via GitHub Actions." Stats: `[{label:'posts published', source:'blogPostCount'}, {label:'running since', value:'Apr 2025'}]`.
  2. sick-pressure-sensor: `embedded`, `C++`, title "Pressure sensor rig". Summary: "Measurement setup using an LVDT pressure sensor and Arduino."
  3. ultrasonic-measurement-device: `embedded`, `MATLAB`, title "Ultrasonic test rig". Summary: "Measurement setup using an ultrasonic sensor and a single-axis linear system."
  4. mate_service: `embedded`, `C++ · ESP32`, title "Mate Service". Summary: "Inventory tracker for shared office consumables. Runs standalone on an ESP32-C3 or on a Node.js server."
  5. corona_test_kit: `ai`, `Python`, title "Flu vs COVID-19 classifier", icon `flask`. Summary: "2020 machine-learning prototype: a Flask web app with a logistic-regression model trained on symptom data." No collaborator credit and no demo link.
  6. position-detection-system: `embedded`, `C++`, title "Position detection", icon `chip`. Summary: "Detects position using a resistance strip and an Arduino."

  Repo URLs are `https://github.com/phani92/<repo>`.

- [ ] **Step 7: Implement `js/home.js`.**
  - Fetch `data/projects.json` and render it with `projectTileHTML` into `#project-grid`.
  - Render the filter chips All, Embedded and AI as `<button aria-pressed>`.
  - If the fetch fails, show "Projects couldn't load. See them on GitHub." with a link to the GitHub profile.
  - For a broken image: in an `error` listener on each tile image, replace it with the icon block (reuse the `tile-icon` markup).
  - Add `js/projects.js` then `js/home.js` to `index.html` after `js/site.js`.

- [ ] **Step 8: Style the grid in `css/home.css`.**
  - **Desktop:** three columns. The featured tile spans two rows. Use `grid-auto-flow: dense`, and give any tile left alone in the last row a span that fills the row, so there are no holes.
  - **≤ 960px:** two columns, with the featured tile spanning both.
  - **≤ 600px:** one column.
  - Tile category colors per Global Constraints. Use a subtle hover lift, turned off under `prefers-reduced-motion`.

- [ ] **Step 9: Verify in a browser** at 1280, 768 and 360 wide.
  - Under All, Embedded and AI the chip counts are 6, 4 and 2, with no empty grid cells (screenshot each).
  - Each tile opens the correct repo.
  - Rename one image path in devtools via `browser_evaluate` (set `img.src` to a missing file) and confirm the icon fallback appears.
  - No horizontal scroll and no console errors.

- [ ] **Step 10: Commit**
```bash
git add data images/projects js/projects.js js/home.js tests/projects.test.js index.html css/home.css
git commit -m "Add hand-picked project grid with filters and project images"
```

---

### Task 4: blogBot stats and live strip

**Files:**
- Modify: `js/home.js`, `index.html` (add `js/blog-utils.js` before `js/home.js`; fill in the `#live` markup), `css/home.css`

**Interfaces:**
- Consumes: `BlogUtils.countPosts`, `latestDiary`, `parseBlogFile`, `extractTitle`, `formatDate`, `isLive` (Task 1), and the `[data-stat-source="blogPostCount"]` element from Task 3.
- Produces:
  - **`#live` markup:**
    - `<span class="live-badge">` reading "● Live" in `#3ddc97`, shown only when live; otherwise its text is "Latest post" in muted color
    - `<a class="live-title">`
    - `<span class="live-date">`
    - `<a class="pill">Read the diary →</a>`
  - Both links point to `html/blogs.html#<filename>`.

- [ ] **Step 1: Implement `loadBlogData()` in `js/home.js`.**
  - Fetch `blogs/blogList.json`. Set every `[data-stat-source="blogPostCount"]` to `countPosts(list)` formatted with a thousands separator, or leave "—" when it's `null`. Run this after the projects have rendered, so the element exists.
  - Fetch `blogs/<latestDiary(list)>` and set the title using `textContent` only, with the date as `formatDate(parseBlogFile(name).date)`.
  - Show the live badge when `isLive(date, new Date())`.
  - Un-hide `#live` only after both fetches succeed and the title is non-null. On any failure leave it hidden, with no error shown.

- [ ] **Step 2: Style `#live` in `css/home.css`** as in the mockup: a purple-to-cyan tinted card. On ≤ 600px the text stacks above the button.

- [ ] **Step 3: Verify in a browser.**
  - The strip shows "The Binary Soul…" only if that is the newest diary title. Compare with the first `# ` line of the file named first in `blogs/blogList.json`.
  - The date is 6 Oct 2026, with **no** "Live" badge (the newest post is 12 days old).
  - The featured tile's posts stat equals `python3 -c "import json;print(len(json.load(open('blogs/blogList.json'))))"`.
  - **Simulate a new post:** create `blogs/Bots_diary_<today as YYYY_MM_DD>.md` containing `# Test **post**`, prepend its name to `blogList.json`, and reload. Confirm:
    - the strip title reads "Test post"
    - the badge reads "● Live"
    - the posts stat went up by one

    Then remove the file and restore the list: `rm blogs/Bots_diary_<today>.md && git checkout blogs/blogList.json`.
  - **Simulate a failure:** temporarily rename `blogs/blogList.json`, reload, and confirm the strip is hidden, the stat shows "—" and the rest of the page is fine. Then restore it with `git status` clean for `blogs/`.

- [ ] **Step 4: Commit**
```bash
git add js/home.js index.html css/home.css
git commit -m "Show live blogBot post count and latest-post strip"
```

---

### Task 5: Blog page redesign

**Files:**
- Rewrite: `html/blogs.html`, `js/blogs.js`
- Create: `css/blog.css`

**Interfaces:**
- Consumes:
  - `BlogUtils.blogLabel` and `resolvePostFromHash` (Task 1)
  - the `SiteUtils` nav and email wiring (Task 2)
  - the nav and footer markup contract, with paths prefixed `../`: the brand and Work/Services links go to `../index.html`, `../index.html#work` and `../index.html#services`
- Produces: `html/blogs.html#<filename>` opens that post. This is what the Task 4 links rely on.

- [ ] **Step 1: Rewrite `html/blogs.html`.**
  - `<title>Bot's diary · Phani!</title>`, the Inter font link, `../css/base.css` and `../css/blog.css`.
  - The shared nav and footer.
  - A short intro line: "Written daily by blogBot, an AI agent." linking to `https://github.com/phani92/blogBot`.
  - `<aside class="blog-list">` with `<ul id="blog-list">`, and `<article id="blog-content">`.
  - **Scripts:** `https://cdn.jsdelivr.net/npm/marked@12.0.2/marked.min.js` (no local reference; the dead `js/marked.min.js` reference and the inline CDN-retry script go away), `../js/site.js`, `../js/blog-utils.js`, `../js/blogs.js`.

- [ ] **Step 2: Rewrite `js/blogs.js`.**
  - Fetch `../blogs/blogList.json` and build the list with `blogLabel(name)` as the link text and `href="#<name>"`.
  - On load and on `hashchange`, open `resolvePostFromHash(location.hash, list)`, mark its link `.active` and scroll it into view in the list.
  - Render with `marked.parse` when it's available. Otherwise keep the existing escape-first fallback renderer from the current `js/blogs.js` as it is: copy the fallback branch from `git show main:js/blogs.js`.
  - Keep the existing error messages for a failed list fetch or post fetch.

- [ ] **Step 3: Write `css/blog.css`.**
  - **Desktop:** sidebar about 280px wide that scrolls on its own, with the post area capped at about 72ch.
  - **≤ 720px:** the list becomes a collapsible `<details>`-style block above the post. Either use a `<details>` element or a toggle button; the builder chooses.
  - **Markdown styles:** h1–h3 in Inter 700/800, a line height of about 1.7, links in cyan, and `hr` (from `***`) as a thin `#23233a` rule with spacing.

- [ ] **Step 4: Verify in a browser.**
  - Open `http://localhost:8000/html/blogs.html`: the newest post opens and the list shows readable labels, with the last two reading "NVIDIA stock · …".
  - Open `…/blogs.html#Bots_diary_2025_10_19.md`: that post opens.
  - Open `…/blogs.html#nope.md`: the newest post opens.
  - From the homepage, "Read the diary →" lands on the right post.
  - Repeat at 360 wide with no horizontal scroll. The list collapses, and the Email me and menu work.
  - Block `cdn.jsdelivr.net` with `browser_network_request` or route interception if available (otherwise skip and note it) and confirm the fallback renderer shows readable text.

- [ ] **Step 5: Commit**
```bash
git add html/blogs.html js/blogs.js css/blog.css
git commit -m "Redesign blog page with readable post list and deep links"
```

---

### Task 6: Docs and final check

**Files:**
- Modify: `README.md`, `CLAUDE.md`

- [ ] **Step 1: Update `README.md`.** Describe the new structure: `index.html`, `css/`, `js/` utilities and page scripts, `data/projects.json`, `images/projects/`, the blog flow from blogBot, how to run (`python -m http.server`) and how to test (`node --test tests/`). Explain how to add a project (edit `data/projects.json`, add an image in `images/projects/`). Remove the EmailJS, `env.js`, `projects.js` GitHub API and profile-placeholder instructions. Keep the license line.

- [ ] **Step 2: Update `CLAUDE.md`.** Replace the architecture section: drop the fragment-loading shell and script-order notes, and the EmailJS and GitHub API details. Describe the new architecture:
  - the shared utilities pattern (a global plus `module.exports`), tested with `node --test tests/`
  - projects coming from JSON
  - the blogBot data contract (`blogs/` and `blogList.json` are written by automation and read-only for the site; the stats and live strip read them)
  - the blog hash deep links
  - the "Live" badge 3-day rule

- [ ] **Step 3: Final check.**
  - `node --test tests/` passes.
  - `grep -rniE "emailjs|api\.github\.com|orbitron|profile-placeholder|env\.js|contact\.js|main\.js" --include=*.html --include=*.js --include=*.css .` prints nothing. Exclude `docs/` and `UI_TEST_REPORT.md` if they match.
  - `git status` shows nothing changed under `blogs/`.
  - Take homepage and blog page screenshots at 1280, 768 and 360 wide, with no console errors and no horizontal scroll.

- [ ] **Step 4: Commit**
```bash
git add README.md CLAUDE.md
git commit -m "Update README and CLAUDE.md for the redesigned site"
```
