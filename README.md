# gta6-trophy-guide-01-entry3

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/shelbyxxx1/gta6-trophy-guide-01-entry3/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/shelbyxxx1/gta6-trophy-guide-01-entry3/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**The Leonida Fieldbook** — an offline trophy guide and tracker for Grand Theft Auto VI on PlayStation 5, built for make.fun's "Build the best GTA 6 trophy guide" bounty ($250, top 50 share).

## What it is

- **All 55 official trophies** with their exact PlayStation names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze), each with a guide written in our own words — what to do, where and how, and when it can be missed — and a source line beside every guide.
- **An 8-stage roadmap to the platinum** that places every trophy exactly once: story and chapters, the six named missions, strangers and side stories, the Leonida collectibles tour, the activities and crime bench, and the 100% push.
- **A missable watchlist built from the official descriptions**: a trophy is flagged only when its description names a condition that can fail in the moment it is attempted (undetected, a single use, back-to-back, a second try, a choice) — 8 trophies flagged, each with its reason stated.
- **A working tracker**: tick trophies off and progress persists in the browser (localStorage), with export to a file and import back, filters by kind (story, missable, collectibles, activities, online — the official list has no online trophies) and by grade, full-text search, a hide-earned toggle, and a spoiler shield that hides story trophy names and descriptions until they are earned.
- **Fully offline**: static files under `app/`, no build step, no network requests at run time, and no Rockstar logo or artwork — the look is the fieldbook's own.

## Run it

```sh
python3 -m http.server --directory app 8080
```

Then open http://localhost:8080 in a desktop browser. Screenshot views used for this entry: `?demo=1` (checklist with sample progress), `?view=roadmap`, `?view=watchlist`, and `?spoiler=1` (spoiler shield on).

## Files

- `app/` — the static guide (index.html, style.css, app.js)
- `app/data/trophies.json` — the 55 trophies with guides, sources, roadmap and method
- `screenshots/` — real renders of this app in a browser
- `main.ts` — copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` with the kit's vendored library
- `vendor/makefun-frontend.ts` — copied from the competition kit, unchanged

## Sources

Trophy names, descriptions, grades and the counts used in guides are from the official PlayStation 5 trophy list for Grand Theft Auto VI, as supplied in the make.fun kit starter data for this competition. The roadmap and missable method follow the competition brief's rule: both are built from the official descriptions. All guide text is original to this entry.

---

<sub>Entered on [make.fun](https://make.fun/?ref=rtcpv23d&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
