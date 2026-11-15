/** Unit checks for canonical URL helpers (mirrors src/lib/site-url.ts). */

const siteUrl = "https://degraudabola.com";

const TRACKING_PARAM_PATTERN =
  /^(utm_|fbclid$|gclid$|gbraid$|wbraid$|msclkid$|mc_|ref$|_ga$|_gl$|yclid$|twclid$|igshid$)/i;

const normalizeCanonicalPath = (path = "/") => {
  const raw = (path || "/").trim() || "/";
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, "");
  const [pathnamePart = "/"] = withoutOrigin.split(/[?#]/);
  let pathname = pathnamePart.startsWith("/") ? pathnamePart : `/${pathnamePart}`;
  pathname = pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
  return pathname || "/";
};

const absoluteUrl = (path = "/") => {
  const normalized = normalizeCanonicalPath(path);
  return normalized === "/" ? siteUrl : `${siteUrl}${normalized}`;
};

const cases = [
  ["/", "https://degraudabola.com"],
  ["/news", "https://degraudabola.com/news"],
  ["/news/", "https://degraudabola.com/news"],
  ["/news?utm_source=x", "https://degraudabola.com/news"],
  ["/artigo/foo?fbclid=1", "https://degraudabola.com/artigo/foo"],
  ["https://www.degraudabola.com/liga/serie-b/", "https://degraudabola.com/liga/serie-b"],
  ["/busca?q=test&utm_campaign=a", "https://degraudabola.com/busca"],
];

let failed = 0;
for (const [input, expected] of cases) {
  const got = absoluteUrl(input);
  const ok = got === expected;
  if (!ok) {
    failed += 1;
    console.error("FAIL", { input, expected, got });
  } else {
    console.log("OK", input, "→", got);
  }
}

// tracking strip sanity
const params = new URLSearchParams("utm_source=x&q=bola&gclid=1");
for (const key of [...params.keys()]) {
  if (TRACKING_PARAM_PATTERN.test(key)) params.delete(key);
}
if (params.toString() !== "q=bola") {
  failed += 1;
  console.error("FAIL tracking strip", params.toString());
} else {
  console.log("OK tracking strip →", params.toString());
}

process.exit(failed ? 1 : 0);
