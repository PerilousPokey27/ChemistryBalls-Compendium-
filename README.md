# Chemistryballs Compendium

A static (no server needed) HTML/CSS/JS site: a searchable Compendium of
"countryball" entries plus user accounts with a customizable profile
("passport"), styled like an old cartography ledger.

## Files

```
countryball-atlas/
├── index.html          Compendium home: search, filter, entry grid, add-entry form
├── entry.html            A single Compendium entry's own detail page
├── auth.html             Log in / sign up (username, or Google)
├── profile.html          "Passport" — edit your display name, bio, avatar colors
├── images/
│   ├── default-ball.png    Unused fallback, kept for reference
│   └── entries/             one spawn-art PNG per Compendium entry
├── css/
│   └── style.css         All styling (design tokens at the top)
├── js/
│   ├── storage.js         All data persistence (localStorage) — users, sessions, entries
│   ├── data.js             Starter Compendium entries (each points at a PNG in images/entries/)
│   ├── ball.js             Generates the profile "passport" avatar as SVG from stripe colors
│   ├── app.js              index.html logic
│   ├── entry.js            entry.html logic
│   ├── auth.js             auth.html logic — also has the Google sign-in setup steps
│   └── profile.js          profile.html logic
└── README.md
```

## Using your own images

Every Compendium entry is a real image now, not a generated graphic — so you
can drop in art for any topic, not just countries.

- **Starter entries**: replace the files in `images/entries/` with your
  own PNGs (keep the same filenames, or update the `image` path for
  each entry in `js/data.js`).
- **New entries added through the site**: the "Add Entry" form has a
  file picker — whatever image you upload is automatically cropped to
  a square and saved with that entry, no code editing needed.
- **No image yet?** Leave the upload blank and the site generates a
  unique placeholder avatar from the entry's name (varied colors,
  patterns, and expressions) — every un-illustrated entry looks
  distinct instead of repeating one flat default graphic. Add real art
  later and it takes over automatically. This logic lives in
  `js/placeholder.js`.

## Page transitions

Every page now fades and rises in gently on load (defined in
`css/style.css` under `pageEnter`) — a simple CSS animation, not a
single-page-app router, so it works the same on every page without
extra JS. It's automatically disabled for anyone with "reduce motion"
turned on in their OS settings.

## Starter data

The Compendium ships with 632 entries: 428 come from the community
rarity list (392 matched to artwork by name, 36 are placeholder-only
for now), plus 204 more illustrated entries that had art but weren't
on the rarity list (shown unranked, sorted to the end). Category
defaults to "Compound" for all of them. 389 have a real written
description (some researched, some from general knowledge); the
remaining 243 (mostly the unranked leftovers) still read "Description
not written yet" and are easy to bulk-edit directly in `js/data.js`
since it's a plain array.

## Image display

Grid thumbnails and the detail-page image both show the full image
without cropping (`object-fit: contain` in a rounded square, not a
circle, and bigger than before) — some source art wasn't perfectly
centered/square and was getting cut off under the old circular crop.

## Performance with a large Compendium

With 600+ entries, the grid paginates automatically (60 per page).
There's a "go to page" jump box next to the page buttons, and clicking
into an entry then hitting "Back to the Compendium" returns you to the
exact page you came from (carried via a `?page=` URL parameter) rather
than resetting to page 1. Thumbnails also lazy-load.
`PAGE_SIZE` in `js/app.js` controls how many entries show per page.

## If the site seems stuck on old data

The site's data lives in each visitor's browser (`localStorage`), not
re-read from `data.js` on every visit. `js/data.js` sets a
`SEED_VERSION` string — bump that any time you change `defaultEntries`
(new art, fixed images, new descriptions, etc.) and every visitor's
browser will automatically refresh its copy of the built-in entries on
next load, without erasing anything they personally added through
"Add Entry". If you ever need to force a manual reset while testing,
open the browser console and run:
`localStorage.removeItem('cbAtlas_entries'); location.reload();`

## Google sign-in setup

Signing in with Google is free to use — Google doesn't charge for the
Sign-In API at normal hobby-project scale. Two things to know:

1. You need your own free Client ID from Google Cloud Console. Full
   steps are in the comment at the top of `js/auth.js` — it's a few
   clicks, no payment info required.
2. Google Sign-In requires the site to be served from a real
   `http://` or `https://` address — it will not work if you just
   double-click `index.html` and open it as a `file://` page. Use the
   local server command below, or deploy it (also free — see below).

Until you add your Client ID, the button shows a short setup reminder
instead of failing silently — everything else on the site works fine
without it.

## Running it

No build step, no install. Just open `index.html` in a browser. To avoid
any browser quirks with opening files directly, you can also serve it
locally:

```
cd countryball-atlas
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Important: how data is stored right now

This version has **no backend** — everything (accounts, passwords,
Compendium entries people add) is saved in `localStorage`, which is local to
one browser on one device. That means:

- If you and a friend both open the site, you won't see each other's
  accounts or entries — you're each writing to your own browser's storage.
- Clearing browser data / using a different browser or device starts fresh.
- This is genuinely free to host (it's just static files — GitHub Pages,
  Netlify, or Vercel will all serve it at no cost), but it isn't yet a
  shared, multi-person Compendium.

If/when you want entries and accounts to be visible to *everyone* who
visits the site, that's the point where you'd add a small real backend
(for example Supabase, which has a free tier and handles accounts + a
shared database in one place) — happy to help with that step whenever
you're ready.

## Extending it

- **New entries**: log in and use "+ Add Entry" — no code needed.
- **Change the theme**: colors, fonts, and spacing are defined as CSS
  variables at the top of `css/style.css`.
- **Replace the starter entries**: edit the `defaultEntries` array in
  `js/data.js` (only used the very first time, before any real entries
  are saved).
- **Avatar look**: `js/ball.js` builds each avatar from a small list of
  hex colors — no image files to manage.
