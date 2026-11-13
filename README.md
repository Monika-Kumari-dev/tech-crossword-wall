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


## Shared scores on Netlify (three devices)

Deploy this repository through Netlify's Git integration. `netlify.toml` builds the
Vite site and deploys the attendance Function. Uploading only `dist` does not deploy
the server function.

1. Deploy the repository to Netlify, including its Function.
2. Open the same production site URL on all three devices and start separate games.
3. Open Organizer Dashboard on any device. Shared scores load automatically and
   refresh every 10 seconds. Export for Excel downloads one combined CSV with
   exactly Name, Email ID, and Score.

No password or environment variable is required. Anyone with the site URL can view
and export the shared attendee list.

Scores are stored in site-wide Netlify Blobs, separately from the deploy itself.
Preview deploys use a separate store. Each email appears once, showing the latest
game's score. Score snapshots are isolated by game session to avoid devices
replacing each other's progress. Existing browser-only records are not uploaded
retroactively.

If a save fails, the device retains a pending upload and retries every 10 seconds
and when the connection returns. Keep the site open until the sync notice clears.
Starting a new player does not delete pending uploads. Shared scores need Internet
access. `npm run dev` serves only the frontend; use Netlify Dev for local Functions.

Run backend checks with `node --test tests/attendance-handler.test.js`.
