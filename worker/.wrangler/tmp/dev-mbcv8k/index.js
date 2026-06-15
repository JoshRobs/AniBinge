var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
var CACHE_TTL = 60 * 60 * 48;
var JIKAN_PAGE_DELAY = 500;
var corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};
function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra }
  });
}
__name(json, "json");
var delay = /* @__PURE__ */ __name((ms) => new Promise((r) => setTimeout(r, ms)), "delay");
function monthToSeason(month) {
  if (month <= 3) return "winter";
  if (month <= 6) return "spring";
  if (month <= 9) return "summer";
  return "fall";
}
__name(monthToSeason, "monthToSeason");
function currentSeason() {
  const now = /* @__PURE__ */ new Date();
  return { season: monthToSeason(now.getUTCMonth() + 1), year: now.getUTCFullYear() };
}
__name(currentSeason, "currentSeason");
function lastFinishedSeason() {
  const now = /* @__PURE__ */ new Date();
  const month = now.getUTCMonth() + 1;
  const year = now.getUTCFullYear();
  if (month <= 3) return { season: "fall", year: year - 1 };
  if (month <= 6) return { season: "winter", year };
  if (month <= 9) return { season: "spring", year };
  return { season: "summer", year };
}
__name(lastFinishedSeason, "lastFinishedSeason");
async function jikanFetch(url, attempt = 1) {
  const res = await fetch(url);
  if (res.status === 429) {
    if (attempt >= 3) throw new Error("Jikan rate limit exceeded");
    await delay(1e3 * attempt);
    return jikanFetch(url, attempt + 1);
  }
  if (!res.ok) throw new Error(`Jikan error ${res.status}`);
  return res.json();
}
__name(jikanFetch, "jikanFetch");
function mapAnime(a) {
  return {
    id: a.mal_id,
    title: a.title,
    title_english: a.title_english ?? null,
    episodes: a.episodes ?? 0,
    score: a.score ?? 0,
    start_date: a.aired?.from ?? "",
    end_date: a.aired?.to ?? null,
    image: a.images?.jpg?.large_image_url ?? a.images?.jpg?.image_url ?? "",
    synopsis: a.synopsis ?? null,
    streaming: [],
    type: a.type ?? null,
    genres: (a.genres ?? []).map((g) => g.name)
  };
}
__name(mapAnime, "mapAnime");
async function fetchJikanSeason(season, year) {
  const results = [];
  let page = 1;
  let hasNextPage = true;
  while (hasNextPage) {
    const { data, pagination } = await jikanFetch(
      `https://api.jikan.moe/v4/seasons/${year}/${season}?page=${page}`
    );
    const filtered = data.filter((a) => a.type === "TV" || a.type === "ONA");
    results.push(...filtered.map(mapAnime));
    hasNextPage = pagination.has_next_page;
    page++;
    if (hasNextPage) await delay(JIKAN_PAGE_DELAY);
  }
  const seen = /* @__PURE__ */ new Set();
  return results.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
__name(fetchJikanSeason, "fetchJikanSeason");
var ANILIST_QUERY = `
  query ($season: MediaSeason, $year: Int, $page: Int) {
    Page(page: $page, perPage: 50) {
      pageInfo { hasNextPage }
      media(season: $season, seasonYear: $year, type: ANIME) {
        idMal
        episodes
        externalLinks {
          site
          url
          type
        }
      }
    }
  }
`;
async function fetchAniListData(season, year) {
  const result = /* @__PURE__ */ new Map();
  let page = 1;
  let hasNextPage = true;
  while (hasNextPage) {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: ANILIST_QUERY,
        variables: { season: season.toUpperCase(), year, page }
      })
    });
    if (!res.ok) throw new Error("AniList fetch failed");
    const { data } = await res.json();
    hasNextPage = data.Page.pageInfo.hasNextPage;
    page++;
    for (const entry of data.Page.media) {
      if (!entry.idMal) continue;
      result.set(entry.idMal, {
        episodes: entry.episodes ?? null,
        streaming: (entry.externalLinks ?? []).filter((l) => l.type === "STREAMING").map((l) => ({ name: l.site, url: l.url }))
      });
    }
  }
  return result;
}
__name(fetchAniListData, "fetchAniListData");
async function warmSeason(season, year, env) {
  const [jikanResult, anilistResult] = await Promise.allSettled([
    fetchJikanSeason(season, year),
    fetchAniListData(season, year)
  ]);
  if (jikanResult.status === "rejected") throw new Error(jikanResult.reason?.message);
  const anilistMap = anilistResult.status === "fulfilled" ? anilistResult.value : /* @__PURE__ */ new Map();
  const anime = jikanResult.value.map((a) => {
    const al = anilistMap.get(a.id);
    return {
      ...a,
      episodes: a.episodes === 0 && al?.episodes ? al.episodes : a.episodes,
      streaming: al?.streaming ?? []
    };
  });
  await env.ANIBINGE_CACHE.put(
    `season:${year}:${season}`,
    JSON.stringify(anime),
    { expirationTtl: CACHE_TTL }
  );
}
__name(warmSeason, "warmSeason");
var src_default = {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }
    const { pathname } = new URL(request.url);
    const match = pathname.match(/^\/season\/(\d{4})\/(winter|spring|summer|fall)$/);
    if (!match) return new Response("Not found", { status: 404, headers: corsHeaders });
    const year = parseInt(match[1]);
    const season = match[2];
    const cacheKey = `season:${year}:${season}`;
    const cached = await env.ANIBINGE_CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" }
      });
    }
    try {
      await warmSeason(season, year, env);
      const body = await env.ANIBINGE_CACHE.get(cacheKey);
      return new Response(body, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" }
      });
    } catch (e) {
      return json({ error: e.message }, 500);
    }
  },
  async scheduled(_event, env, ctx) {
    const seasons = [lastFinishedSeason(), currentSeason()];
    ctx.waitUntil(
      Promise.allSettled(seasons.map(({ season, year }) => warmSeason(season, year, env)))
    );
  }
};

// ../../../../Users/jdrjo/AppData/Roaming/fnm/node-versions/v23.11.0/installation/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../Users/jdrjo/AppData/Roaming/fnm/node-versions/v23.11.0/installation/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-jaWsNP/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../Users/jdrjo/AppData/Roaming/fnm/node-versions/v23.11.0/installation/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-jaWsNP/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
