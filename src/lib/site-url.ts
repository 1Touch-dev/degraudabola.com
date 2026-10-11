import { siteConfig } from "@/lib/site-config";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  siteConfig.seo.canonicalHost ||
  "https://degraudabola.com"
).replace(/\/$/, "");

export const absoluteUrl = (path = "/"): string => {
  if (!path || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
