# Tech Crossword Wall

An interactive crossword for GED Week FY27 in Bangalore, with 24 clues across AI, Coding, Engineering, and Intuit / GED.

## Run locally

```sh
npm install
npm run dev
```

## Check and build

```sh
npm run lint
npm run build
npm run preview
```

Built with React and Vite. Players solve clues, use hints, track score and time, and can finish early. On Netlify, names, emails, and scores sync across devices through a Netlify Function and Netlify Blobs. Local results remain in the browser as a backup.

## Content

The clue bank comes from GED Activation Content Ideas for November 16–20, 2026. The source content is marked Intuit Confidential and Proprietary.


## Three devices and admin access

Deploy this repository through Netlify's Git integration. Uploading only `dist`
does not deploy the attendance Function.

The first screen is an admin login, before the home page or any other route.
Use username **`info@techfluence`** on all three TVs. The password comes from the
existing **`Demo1`** Netlify environment variable (at least 12 characters,
Production context, Functions scope). `Demo2` and `Demo3` are no longer used.
Redeploy after configuring the password. Never use a `VITE_` variable for it.

Each TV needs its own signed-in session. Player registration is also blocked on
the server unless that TV has an active admin session. Signing out returns to the
entry form. Sessions last 8 hours; refresh restores an active session, and expired
sessions must sign in again. The previous demo1/demo2/demo3 usernames are retired.

The login screen uses the reference PDF's vector tracks and logo, and sizes to
16:9 TV viewports (1920×1080 and 3840×2160) without page scrolling.

Open these URLs on the three stations, replacing the domain with your site:

- Device 1: `https://YOUR-SITE.netlify.app/?device=1`
- Device 2: `https://YOUR-SITE.netlify.app/?device=2`
- Device 3: `https://YOUR-SITE.netlify.app/?device=3`

Each browser remembers its assigned station; URLs without a station default to 1
on a new browser. Keep the same station URL on each physical device. Station IDs
identify event stations, not hardware, so two browsers using device=1 share that
station's email restriction and records.

The existing name/email form registers players online before starting. Emails
are trimmed and lowercased and may register once per station. An atomic claim
prevents simultaneous duplicate registrations on one station. The same email can
play on the other two stations. Registration checks availability, not email
ownership; this is not an email-verification flow. A registered email stays used
even if the player leaves before finishing.

Scores are stored in three separate Netlify Blobs stores. The shared admin can
open Organizer Dashboard, view all stations, filter by device, and export
CSV with a Device column. Anonymous API requests cannot read the attendee list.
Admin protection is enforced in the Function, including for exports. Auth uses
HttpOnly, SameSite=Strict cookies; production cookies also use Secure.

Preview deploys use separate stores. This version uses new per-device stores;
previous records remain in the old shared store and browser backups and are not
automatically migrated or counted toward the new email restrictions.

Failed score uploads remain in the browser and retry while the page stays open.
Legacy pending records without registration credentials remain as local backups
and do not block new uploads. Admins can export local browser records if shared
storage is unavailable after signing in. Player registration requires connectivity
so uniqueness can be enforced across browsers.

`npm run dev` proxies login, registration and score requests to the deployed
Netlify site at `https://gorgeous-sunflower-331fdb.netlify.app`. Local play therefore
uses the same records and email restrictions as the live site. Restart Vite after
changing proxy configuration. Override `NETLIFY_DEV_BACKEND` in `.env.local` to
use another Netlify site. For isolated local Functions, use Netlify Dev instead. Run `npm test`, `npm run lint`
and `npm run build` for checks.
