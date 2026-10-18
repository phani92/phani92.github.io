# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A personal portfolio site in plain HTML, CSS and vanilla JS, served by GitHub Pages (custom domain in `CNAME`). No build step, bundler or package manager: do not add a `package.json`. External resources are limited to Google Fonts (Inter) and `marked@12.0.2` from jsDelivr.

## Commands

- Run locally: `python -m http.server`, then open `http://localhost:8000`. Pages use `fetch()`, so `file://` won't work.
- Test: `node --test tests/*.test.js`. Use the glob: `node --test tests/` fails on Node 23.

## Architecture

Two standalone pages, `index.html` and `html/blogs.html`, sharing `css/base.css` and `js/site.js`. All asset paths are relative (the blog page uses `../`).

**Utilities vs. wiring.** `js/site.js` (`SiteUtils`), `js/blog-utils.js` (`BlogUtils`) and `js/projects.js` (`ProjectUtils`) each set one global and end with `if (typeof module !== 'undefined') module.exports = <Global>;` so `tests/*.test.js` can `require` them in Node. Keep them pure and DOM-free where tested. `js/home.js` and `js/blogs.js` are the untested page wiring.

**Projects come from `data/projects.json`.** Array order is display order. The featured tile (blogBot) must stay first because the bento grid's CSS assumes it to avoid holes. Images live in `images/projects/`. Stat values with a `source` (for example `blogPostCount`) are filled at runtime: set `Home.stats[source]` and call `Home.applyStats()`. Don't write straight to the DOM, because filter clicks re-render the tiles and `applyStats` reapplies the values.

**Email is assembled in JS** by `SiteUtils`, never written as a literal address in HTML, to keep it away from scrapers. Leave it that way.

## blogBot data contract

`blogs/` (`Bots_diary_YYYY_MM_DD.md`, plus older `stock_*` posts) and `blogs/blogList.json` are written by the external [blogBot](https://github.com/phani92/blogBot) repo through GitHub Actions. They are read-only for this site: never edit or reformat them. `blogList.json` is a flat array of filenames, newest first, and a post only exists on the site once it is listed. The homepage post count and live strip, and the blog page, all read these.

- **Live badge:** a post is "Live" for 3 days after its date (`BlogUtils.isLive`, default `maxAgeDays` of 3).
- **Deep links:** `html/blogs.html#<filename>` opens that post. `BlogUtils.resolvePostFromHash` only accepts names found in `blogList.json`, so the hash can never fetch an arbitrary path. With no valid hash, the newest post opens.

## Deliberate copy and gotchas

- The live strip on the homepage and the blog disclaimer "A learning experiment. Not personal opinion." are intentional. Don't remove them.
- The nav and footer markup is duplicated in both HTML files, so change both.
- `UI_TEST_REPORT.md` and `docs/` are historical snapshots (an old audit; the redesign spec and plan), not live documentation.
