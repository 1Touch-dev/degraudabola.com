import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { absoluteUrl, normalizeCanonicalPath } from "@/lib/site-url";

export interface IPageMetaInput {
  title?: string;
  description?: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
  noIndex?: boolean;
  /** When set, overrides path-based self-referencing canonical. */
  canonicalPath?: string;
}

/**
 * Build page metadata with a single absolute HTTPS self-referencing canonical.
 * Path-only: never includes tracking or unrelated query strings.
 */
export const pageMetadata = ({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  image,
  noIndex,
  canonicalPath,
}: IPageMetaInput): Metadata => {
  const url = absoluteUrl(normalizeCanonicalPath(canonicalPath ?? path));
  const ogImage = image || siteConfig.seo.defaultOgImage;
  const ogImageUrl = ogImage.startsWith("http") ? ogImage : absoluteUrl(ogImage);

  return {
    ...(title !== undefined ? { title } : {}),
    ...(description !== undefined ? { description } : {}),
    alternates: {
      canonical: url,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      url,
      siteName: siteConfig.siteName,
      locale: siteConfig.locale.dialect.replace("-", "_"),
      type,
      publishedTime,
      modifiedTime,
      images: [{ url: ogImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      images: [ogImageUrl],
    },
  };
};
