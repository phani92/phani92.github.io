# Portfolio redesign: design

Date: 2026-10-18
Status: draft for owner review

Reference mockup (desktop homepage, option C "Bold and modern"): `2026-10-18-portfolio-redesign-mockup.html` in this folder. It is an HTML fragment with inline styles, so open it in a browser or read the markup. Its layout, palette and section order are approved. Its wording is placeholder unless this document says otherwise.

## Intent

The owner, Phani, feels the current site at phani92.github.io looks old and boring. Today it opens with "Hello World! I am Phani!", a general paragraph including hobbies, a list of GitHub repos filtered to those with at least one star (so only three appear), and an EmailJS contact form.

The site has two audiences:

1. **Recruiters and hiring managers**, now.
2. **Freelance and consulting clients**, over time. The owner wants to move toward freelancing gradually.

It sells two offers: **embedded systems** (C/C++ firmware, sensors, measurement and test rigs, microcontrollers) and **AI automation** (Python agents and pipelines that run without a person involved). Projects are the evidence. Within a few seconds a visitor should understand "embedded plus AI automation", see hand-picked projects that prove it, and know how to reach the owner, through LinkedIn or email, both reachable from the top menu.

## Goals

- Replace the current look with the approved **option C, "Bold and modern"** visual direction.
- Make the two offers obvious near the top of the page.
- Show a **hand-picked** project lineup with real descriptions and images, replacing the star-filtered GitHub API list.
- Feature **blogBot** prominently as the AI showcase, with a live strip showing its latest post. It counts as proof because it runs every day.
- Restyle the blog page to match the new look.
- Work well on phones.

## Non-goals

- Moving hosting to Vercel. That is a separate decision; the site must keep working on GitHub Pages and stay host-agnostic.
- Any contact form or email-sending service. EmailJS is removed. Contact goes through LinkedIn and a plain `mailto:` "Email me" link.
- A profile photo, a CV or download-CV button, or a "hire me" section at the bottom of the page. The owner explicitly asked to remove all of these. The "Email me" button in the top menu was requested later by the owner and is not a hire-me section.
- Fixing blogBot. Google removed the Gemini model it used, so it currently posts irregularly. The owner will fix it separately in the blogBot repo, ideally before this redesign launches.
- Changing blogBot, the blog post content, or how posts are published.
- Adding a framework, build step, bundler or package manager.
- A light theme. The approved design is dark only.

## Anti-goals (failure even if it technically works)

- **Breaking blogBot's automated publishing.** blogBot is an external repo whose GitHub Action commits new `blogs/Bots_diary_YYYY_MM_DD.md` files to this repo and adds each filename to `blogs/blogList.json`. Those paths and the JSON format (a flat array of filenames, newest first) must not change.
- **Overclaiming.** Don't invent stats or credentials. Present the corona project as a small 2020 machine-learning prototype, never as a diagnostic or medical tool.
- Looking like a generic template, or losing the "embedded + AI" identity under decoration.
- A heavy or slow page, such as unoptimized multi-hundred-KB images or large script libraries.
- A layout that breaks or scrolls sideways on a phone.

## Constraints

- Plain HTML, CSS and vanilla JavaScript with no build step, served as static files. Locally it runs with `python -m http.server`. Production is GitHub Pages with the custom domain in `CNAME`, which must be kept.
- All paths must be relative so the site works on any static host.
- External resources are limited to Google Fonts and, if needed, one CDN script (the `marked` Markdown library for the blog page).
- `blogs/` and `blogs/blogList.json` are written by automation. The site reads them and never writes them.

## Decisions made with the owner

### Visual direction: option C, "Bold and modern"

As in the mockup:
- Near-black background, `#0b0b12`.
- Soft radial glows in purple `#7c5cff` and cyan `#00c8ff` behind the hero.
- A big, tight, heavy sans-serif headline. The mockup uses Inter at weight 800.
- The second line of the headline uses a purple-to-cyan gradient.
- Rounded cards with large radii (about 18–20px) and subtle borders.
- Pill-shaped buttons and filter chips.
- **Category colors:** cyan for embedded, purple for AI. They are used consistently on service cards, project tags and tiles.

The old Orbitron font and the "Hello World" intro go away.

### Page structure (homepage, one long page, top to bottom)

1. **Nav:**
   - **Left:** the name **"Phani!"**, with the "!" in accent purple `#7c5cff`. Use the same name in the footer and in the page `<title>`.
   - **Right:** links Work (scrolls to projects), Services (scrolls to "What I do") and Blog (the blog page). A thin divider follows, then a **GitHub** icon link, a **LinkedIn** icon link and a pill-shaped **"✉ Email me"** button, as in the mockup.
2. **Hero:** a small pill reading "Embedded systems · AI automation", the headline "From silicon / to smart agents.", one supporting sentence, and a single "See my work →" button that scrolls to projects. There is no photo.
3. **What I do:** two service cards, Embedded systems (cyan) and AI automation (purple). Each has an icon, a title and one or two lines.
4. **Selected work / Projects:** a bento grid with filter chips All, Embedded and AI. blogBot is the large featured tile. The other tiles are smaller cards with an image area on top and a category/tech tag and title below. Each tile links to its GitHub repo.
5. **Live strip:** shows blogBot's latest post title and date, with a "Read the diary →" link to the blog page.
6. **Footer:** "© <year> Phani!", text links to GitHub (https://github.com/phani92) and LinkedIn (https://www.linkedin.com/in/phanindra-kumar-yellapu), and the email address shown as plain, copyable text.

### Contact (owner-approved)

- **The email address is phanindra.yellapu@gmail.com.**
- **"Email me" is a plain `mailto:` link**, with no sending service and no form. It opens the visitor's own mail app with the To field filled in. The owner understands that on desktops without a configured mail app the link may do nothing, which is why the footer also shows the address as copyable text.

### blogBot "daily" claim (owner-approved)

The owner is fixing blogBot, so the site may describe it as publishing **daily**. Its recent posting record has been irregular because Google retired the model it used.

### Project lineup (owner-approved)

| Project (repo under github.com/phani92) | Category | Card treatment |
|---|---|---|
| `blogBot`: **featured** | AI · Python | Large featured tile with no image. It shows a description and two stats: **posts published** and **running since April 2025**. Description, from its README: an AI agent that pulls current Google News headlines, picks a random topic, format and tone, has Gemini write a post, and publishes it daily through a GitHub Actions cron. |
| `corona_test_kit` | AI · Python | Smaller tile. Framed as a 2020 machine-learning prototype: a Flask web app with a logistic-regression model trained on symptom data to distinguish flu from COVID-19. The repo has no images, so it gets an icon tile. Link to the GitHub repo only, because the old live demo at coronatest.pythonanywhere.com returns 404. |
| `sick-pressure-sensor` | Embedded · C++ | Measurement setup using an LVDT pressure sensor and Arduino. Image taken from the repo's `images/` folder, which holds slides from the 2017 project presentation. |
| `ultrasonic-measurement-device` | Embedded · MATLAB | Measurement setup using an ultrasonic sensor and a single-axis linear system. Image: the CAD render `cad files/assembly-bild.PNG`. |
| `mate_service` | Embedded · C++ | Inventory management for shared office consumables. It runs standalone on an ESP32-C3 or on a Node.js server. Image: `screenshots/desktop.png`. |
| `position-detection-system` | Embedded · C++ | Detects position using a resistance strip and an Arduino. The repo has no images, so it gets an icon tile. |

Excluded: the notes repos (`algoAndDs`, `c-`, `python`), forks, `analogClock`, `everything_to_csv` and this site's own repo.

**Images come from the projects' GitHub repos**, as the owner asked.

### Removals

- **EmailJS and the contact section:** `js/env.js`, `js/contact.js`, `css/contact.css` and `html/contact.html`, along with their keys.
- **The GitHub API project fetch:** `js/projects.js` and `html/projects.html`.
- **The old profile section:** `html/profile.html` and `images/profile-placeholder.jpg`.
- **The Orbitron font.**

## Calls made by Claude (not explicitly decided by the owner; flag in review)

- **Homepage markup lives in `index.html` directly.** The current pattern of fetching HTML fragments from `html/` into the shell goes away, since the sections no longer need separate files. The blog page stays a separate page (`html/blogs.html`).
- **Projects come from a small data file**, `data/projects.json`, rendered by a small script into the bento grid. It has an ordered list with fields such as id, title, category, tech, summary, repo URL, an optional image path, an optional icon, a featured flag, and optional extra-detail text. Order in the file is display order. The filter chips filter this list on the client. Adding a project later should mean editing JSON only.
- **Project images are copied into this repo** (for example `images/projects/`), resized and compressed for the web, rather than hotlinked from raw.githubusercontent.com. That way a rename in another repo can't break the site. Aim for well under about 150 KB per image, using WebP or a compressed JPG/PNG. For `sick-pressure-sensor`, choose the clearest photo or diagram slide; the larger files such as `.026`, `.035` and `.036` are likely photos or rich diagrams. Look at them and pick.
- **blogBot stats are computed live, not hardcoded.** "Posts published" is the length of `blogs/blogList.json`. "Running since" is "April 2025", the earliest post date, and may be hardcoded. The list holds two old `stock_NVIDIA_2025_04_1x.md` files at the end that aren't diary posts. Count every file in the list, or only `Bots_diary_*`; either is fine, but use the same rule everywhere.
- **The live strip reads the newest post.** Use the first entry of `blogList.json` whose name matches `Bots_diary_YYYY_MM_DD.md`. Take the title from the first `# ` heading in that Markdown file, with Markdown stripped, and the date from the filename. If anything fails to load, hide the strip quietly; don't show an error. **Stale rule:** show the "● Live" label only when the newest post is no more than 3 days old by the visitor's clock. Otherwise drop the label and show "Latest post · <date>" in a neutral color, so a paused bot never looks broken or overclaimed.
- **Email link details:**
  - **Subject:** prefill "Hello from your portfolio" so the owner can spot these emails.
  - **Spam protection:** build the address in JavaScript from parts, not as one literal string in the HTML, to deter simple scrapers. With JavaScript off, the button may fall back to linking LinkedIn.
- **Nav on phones:** Work, Services and Blog fold into a menu button. The GitHub icon, the LinkedIn icon and "Email me" stay visible in the bar. "Email me" may shrink to just the ✉ icon on very narrow screens. Icons are inline SVG with accessible labels.
- **"Read the diary →" opens that post.** Link to `html/blogs.html#<filename>`. The blog page opens the post named in the URL hash on load, and otherwise opens the newest post.
- **Blog navigation opens in the same tab.** Today it opens a new tab. The blog page gets the same nav or header as the homepage, so the way back is obvious.
- **Blog page restyle:** same palette, fonts and card language as the homepage. Keep the sidebar list on desktop and make it a collapsible or top list on phones. List entries show a readable label instead of the raw filename: "Bot's diary · 6 Oct 2026" for diary posts and "NVIDIA stock · 14 Apr 2025" for the stock posts. Don't fetch every Markdown file just to build the list, because there are 370+ files. Keep the existing safe fallback renderer used when `marked` isn't available. Markdown body styles (headings, paragraphs, bold and italic, links, `***` rules) must be readable on the dark background.
- **`marked`:** `html/blogs.html` refers to a local `js/marked.min.js` that doesn't exist, so the page always falls back to the CDN today. Either add the file to the repo or load it from the CDN directly. The builder chooses; the dead reference must not remain.
- **Fonts:** Inter from Google Fonts, in the weights actually used.
- **Copy:** the builder drafts final copy from this document and the mockup. Use the hero headline "From silicon to smart agents." as approved in the mockup. Keep the supporting sentence and service blurbs short and plain. The owner reviews all copy at the end. Don't add claims the document doesn't support, such as years of experience, clients or certifications.
- **The corona project names no collaborator (owner-approved).** Show it as a regular project card with no credit line.
- **Unused images** (`images/in-logo/`, `images/github/`, `images/instagram/`) may be deleted if the new design doesn't use them.
- **Docs:** update `README.md`, which describes EmailJS, `projects.js` and the setup steps, and `CLAUDE.md`, whose architecture section describes the fragment-loading shell, to match the new structure.
- Add `.superpowers/` to `.gitignore`. It holds local brainstorming mockups.

## Responsive behaviour

- **Desktop:** as in the mockup. The bento grid has three columns, and the featured tile spans two rows.
- **Tablet:** the bento grid drops to two columns and the featured tile spans the full width.
- **Phone:** one column, with every tile full width and the featured tile first. Service cards stack. The headline scales down fluidly, for example with `clamp()`. The nav follows the phone rule under "Calls made by Claude". The live strip stacks text above its link. Use a 16px side gutter and no horizontal scroll at 360px wide.
- Respect `prefers-reduced-motion` for any hover or entrance animation. Keep animation subtle.
- Keep visible focus states and sufficient text contrast on the dark background, with alt text on project images.

## Left to the builder

- Exact file and folder names beyond those fixed above, and how the CSS is split across files.
- Exact spacing, breakpoints, hover effects and icon choice for the icon tiles and service cards. Use inline SVG or a simple glyph, with no icon font library.
- Whether the filter chips animate.
- The exact image picks within the guidance above, plus resizing and compression tooling.
- The exact `projects.json` schema, within the fields listed.

## How to verify

There is no test suite. Serve with `python -m http.server` and check in a browser, using Playwright if available:

- At 1280px, 768px and 375px wide, the homepage matches the mockup's structure and look, nothing overflows horizontally, and the bento grid reflows as described.
- The filter chips show the right projects: All shows 6, Embedded 4 and AI 2.
- Every tile links to the correct GitHub repo.
- The blogBot post count equals what the chosen counting rule gives from `blogs/blogList.json`. The live strip shows the newest diary post's real title and date. With today's data (newest post 2026-10-06), it shows no "Live" label. With the dummy post below, it does.
- The nav shows GitHub, LinkedIn and Email me at every width. "Email me" opens a `mailto:phanindra.yellapu@gmail.com` link with the subject prefilled. The footer shows the address as text. The full address doesn't appear as one literal string in the HTML source.
- "Read the diary →" opens the blog page with that post open. The blog page lists every post, renders Markdown correctly, works on a phone, and links back home.
- No requests go to EmailJS or `api.github.com`. The browser console shows no errors.
- No leftover references to removed files appear (`env.js`, `contact.js`, `projects.js`, Orbitron, `profile-placeholder.jpg`).
- Simulate a blogBot commit: add a dummy `Bots_diary_2099_01_01.md` and prepend its name to `blogList.json`. Confirm the strip and blog page pick it up with no code changes, then revert.
