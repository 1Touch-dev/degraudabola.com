import { siteConfig } from "@/lib/site-config";

/** Preferred origin: HTTPS, non-WWW, no trailing slash. */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  siteConfig.seo.canonicalHost ||
  "https://degraudabola.com"
)
  .trim()
  .replace(/\/$/, "")
  .replace(/^http:\/\//i, "https://")
  .replace(/^https:\/\/www\./i, "https://");

const TRACKING_PARAM_PATTERN =
  /^(utm_|fbclid$|gclid$|gbraid$|wbraid$|msclkid$|mc_|ref$|_ga$|_gl$|yclid$|twclid$|igshid$)/i;

/**
 * Normalize a path for canonical / sitemap use:
 * absolute paths only, no query/hash, no trailing slash (except root).
 */
export const normalizeCanonicalPath = (path = "/"): string => {
  const raw = (path || "/").trim() || "/";
  const withoutOrigin = raw.replace(/^https?:\/\/[^/]+/i, "");
  const [pathnamePart = "/"] = withoutOrigin.split(/[?#]/);
  let pathname = pathnamePart.startsWith("/") ? pathnamePart : `/${pathnamePart}`;
  pathname = pathname.replace(/\/{2,}/g, "/");
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, "");
  }
  return pathname || "/";
};

/** Strip tracking query params; keep meaningful params when provided. */
export const stripTrackingParams = (
  params?: URLSearchParams | Record<string, string | string[] | undefined> | string
): URLSearchParams => {
  const search =
    typeof params === "string"
      ? new URLSearchParams(params.startsWith("?") ? params.slice(1) : params)
      : params instanceof URLSearchParams
        ? new URLSearchParams(params)
        : new URLSearchParams();

  if (params && typeof params === "object" && !(params instanceof URLSearchParams) && typeof params !== "string") {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        value.forEach((entry) => search.append(key, entry));
      } else {
        search.set(key, value);
      }
    }
  }

  for (const key of Array.from(search.keys())) {
    if (TRACKING_PARAM_PATTERN.test(key)) {
      search.delete(key);
    }
  }
  return search;
};

export const absoluteUrl = (path = "/", query?: URLSearchParams | string): string => {
  const normalized = normalizeCanonicalPath(path);
  const base = normalized === "/" ? siteUrl : `${siteUrl}${normalized}`;
  if (!query) return base;

  const search =
    typeof query === "string"
      ? stripTrackingParams(query)
      : stripTrackingParams(query);

  const qs = search.toString();
  return qs ? `${base}?${qs}` : base;
};

export const canonicalUrl = (path = "/"): string => absoluteUrl(path);
