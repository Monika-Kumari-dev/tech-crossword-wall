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
Use a different login on each TV:

| TV | Login | Netlify password key | Separate storage |
| --- | --- | --- | --- |
| 1 | `Admin1` | `Demo1` | device-1 Blobs store |
| 2 | `Admin2` | `Demo2` | device-2 Blobs store |
| 3 | `Admin3` | `Demo3` | device-3 Blobs store |

Each password must be at least 12 characters. The same password is allowed.
Configure all keys in Production context with Functions scope, then redeploy.
The shared `info@techfluence` login is no longer accepted.

Open the same site URL on all three TVs. The authenticated login assigns the
station automatically; no `?device=` URL is needed. The server verifies the
station assignment before registration, so editing a URL or request cannot
register a player into another station's store. Refresh restores the signed-in
station from its HttpOnly session. Signing out returns to the admin entry form.
Each TV browser has its own 8-hour session.

The TV entry form follows the reference PDF's tracks and logo and is sized for
16:9 viewports at 1920×1080 and 3840×2160 without page scrolling.

The existing name/email form registers players online before starting. Emails
are trimmed and lowercased and may register once per station. An atomic claim
prevents simultaneous duplicate registrations on one station. The same email can
play on the other two stations. Registration checks availability, not email
ownership; this is not an email-verification flow. A registered email stays used
even if the player leaves before finishing.

Scores are stored in three separate Netlify Blobs stores. All three admins can
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
