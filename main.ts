// The Leonida Fieldbook — hand-in program (Node 22, standard library only).
//
// The guide itself is the static site in app/: plain HTML, CSS and JS plus
// app/data/trophies.json, opening in a desktop browser with the network off
// and loading nothing from outside app/. This program is only the courier:
// it copies app/ and screenshots/ into the output directory and writes the
// dossier the judge reads, using the kit's vendored frontend library —
// vendor/makefun-frontend.ts is copied from the kit unchanged, because the
// scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// The output directory defaults to /output when MAKEFUN_OUTPUT_DIR is not
// set, and it is treated as a mount point: it is created if missing and
// never deleted or replaced.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoDir = fileURLToPath(new URL(".", import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, "app"), join(outputDir, "app"), { recursive: true });

const shotsOut = join(outputDir, "screenshots");
mkdirSync(shotsOut, { recursive: true });
const shotsIn = join(repoDir, "screenshots");
if (existsSync(shotsIn)) {
  cpSync(shotsIn, shotsOut, { recursive: true });
}

// The caps mirror the scorer's own limits for this competition: the dossier
// text budget, at most 4 screenshots of at most 256 KiB each, and the app
// tree limits of 993 entries and 48 MiB.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
