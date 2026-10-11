import type { MetadataRoute } from "next";
import { articles as seedArticles, liveStories as seedLiveStories } from "@/data/dummy";
import { BRAZILIAN_STATES } from "@/data/brazilian-states";
import { hasCapability } from "@/lib/capabilities";
import { getCompetitions, isSportsSite } from "@/lib/competitions";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Fully static sitemap — no CMS/network calls.
 * Amplify cold starts were returning 500 to Google ("Couldn't fetch").
 */
export const dynamic = "force-static";
export const revalidate = false;

const sitemap = (): MetadataRoute.Sitemap => {
  const now = new Date();
  const hubs = [
    "/",
    "/ultimas",
    "/news",
    "/categories",
    "/futebol",
    "/ao-vivo",
    "/alertas",
    "/about",
    "/contact",
  ];

  if (hasCapability("states-directory")) {
    hubs.push("/estados");
  }

  const categories =
    siteConfig.navCategories?.map((category) => category.slug) ??
    [];

  return [
    ...hubs.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("hourly" as const) : ("daily" as const),
      priority: path === "/" ? 1 : 0.7,
    })),
    ...categories.map((slug) => ({
      url: absoluteUrl(`/categoria/${slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...(hasCapability("states-directory") ? BRAZILIAN_STATES : []).map((state) => ({
      url: absoluteUrl(`/estados/${state.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...(isSportsSite() ? getCompetitions() : []).map((competition) => ({
      url: absoluteUrl(`/liga/${competition.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...seedArticles.map((article) => ({
      url: absoluteUrl(`/artigo/${article.slug}`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...seedLiveStories.map((story) => ({
      url: absoluteUrl(`/ao-vivo/${story.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
};

export default sitemap;
