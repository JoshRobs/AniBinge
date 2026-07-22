# AniBinge

Plan your anime binge-watching order. Browse current and past seasons, build a
watch list, and see how long it'll actually take to get through it.

Live at **[anibinge.ca](https://anibinge.ca/)**.

## What it does

- **Season browsing** — pick any season/year and get every TV and ONA release,
  merged from MyAnimeList (via [Jikan](https://jikan.moe/)) and
  [AniList](https://anilist.co/) for episode counts and streaming links.
- **Filtering** — minimum score, maximum episode count, hide unscored titles,
  hide single-episode entries, hide still-airing shows, plus search across all
  of MAL rather than just the current season.
- **Binge planner** — add shows to a list and switch to binge mode for a
  timeline showing estimated finish dates, total runtime, and custom ordering
  (drag to reorder, or sort by end date, score, or episode count).
- **Estimates for incomplete data** — shows without a published episode count or
  end date get a projected finish date based on cour length heuristics
  (see [src/utils/anime.ts](src/utils/anime.ts)).
- **Saved lists** — keep multiple named lists in local storage.
- **Sharing & export** — copy a share link (`/share?ids=…`), export the timeline
  to PNG or PDF, or copy it to the clipboard as an image.

Everything user-created lives in `localStorage`; there are no accounts and no
user data on the server.

## Stack

| Layer | |
|---|---|
| Frontend | Vue 3 (`<script setup>`), TypeScript, Vite, Tailwind CSS v4 |
| State | Pinia |
| Routing | Vue Router (history mode) |
| Export | html2canvas + jsPDF |
| Backend | Cloudflare Worker + Workers KV |

## Project layout

```
src/
  api/          Jikan + AniList clients and the Anime type
  components/   Toolbar, filters, anime cards, detail panel, binge timeline
  composables/  PNG/PDF export, persisted state helper
  stores/       Pinia stores (season, anime, planner, binge, saved lists, search, toast)
  utils/        Episode/end-date estimation, client-side anime cache
  views/        PlannerView (main app), ShareView (read-only shared list)
worker/         Cloudflare Worker: season API, KV cache, nightly cache warming
```

## The worker

[worker/src/index.ts](worker/src/index.ts) serves one route:

```
GET /season/:year/:season      # season ∈ winter | spring | summer | fall
```

It fetches the season from Jikan (paginated, rate-limit aware) and AniList in
parallel, merges them, and writes the result to KV — 48h TTL for the current
season, 7 days for finished ones. Responses carry an `X-Cache` header of `HIT`,
`MISS`, or `DEDUP`.

Because a cold season costs 15–25 subrequests, two mechanisms keep that cost
down:

- **Inflight locking** — a short-lived KV key stops concurrent requests from all
  fetching the same uncached season. KV has no atomic CAS, so this reduces
  duplicate fetches rather than eliminating them; waiters poll for up to 30s and
  fall through to fetching themselves if the holder dies.
- **Nightly cron** (`0 3 * * *`) — checks the last 8 seasons and warms at most 2
  uncached ones per invocation to stay under the per-invocation subrequest
  limit. Anything skipped is warmed on demand.

## Development

Requires Node 20+ and a Cloudflare account for the worker.

```bash
npm install
npm run dev              # Vite dev server on :5173
```

The dev server proxies `/season/*` to `http://localhost:8788`, so run the worker
alongside it in a second terminal:

```bash
cd worker
npm install
npx wrangler dev --port 8788
```

Alternatively, point the frontend at the deployed worker by setting
`VITE_API_URL` in a `.env.local` file:

```
VITE_API_URL=https://your-worker.workers.dev
```

### Scripts

| Command | |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check with `vue-tsc`, then build to `dist/` |
| `npm run preview` | Build, then serve through `wrangler dev` |
| `npm run deploy:worker` | Deploy the worker (`cd worker && wrangler deploy`) |

## Deployment

The frontend builds to `dist/` and is served as a static SPA — `public/_redirects`
rewrites all paths to `index.html` so `/share` resolves client-side.

The worker deploys separately with `npm run deploy:worker`. Its KV namespace
binding (`ANIBINGE_CACHE`) and cron trigger are declared in
`worker/wrangler.toml`.

## Data sources

Season and title metadata comes from the [Jikan API](https://jikan.moe/)
(unofficial MyAnimeList API); episode counts and streaming links come from the
[AniList GraphQL API](https://anilist.co/). AniBinge is not affiliated with
either service.
