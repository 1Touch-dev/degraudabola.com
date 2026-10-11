import type { MetadataRoute } from "next";
import { hasCapability } from "@/lib/capabilities";
import {
  getBrazilianStates,
  getCategories,
  getLatestArticles,
  getLiveStories,
} from "@/lib/cms-client";
import { getCompetitions, isSportsSite } from "@/lib/competitions";
import { absoluteUrl } from "@/lib/site-url";

/** Build-time static sitemap so Google Search Console can fetch reliably. */
export const dynamic = "force-static";
export const revalidate = 3600;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
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

  const [articles, categories, states, liveStories] = await Promise.all([
    getLatestArticles(200),
    getCategories(),
    hasCapability("states-directory") ? getBrazilianStates() : Promise.resolve([]),
    getLiveStories(),
  ]);

  return [
    ...hubs.map((path) => ({
      url: absoluteUrl(path),
      lastModified: now,
      changeFrequency: path === "/" ? ("hourly" as const) : ("daily" as const),
      priority: path === "/" ? 1 : 0.7,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/categoria/${category.slug}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...states.map((state) => ({
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
    ...articles.map((article) => ({
      url: absoluteUrl(`/artigo/${article.slug}`),
      lastModified: new Date(article.publishedAt),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...liveStories.map((story) => ({
      url: absoluteUrl(`/ao-vivo/${story.slug}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.6,
    })),
  ];
};

export default sitemap;
