import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import CategoryLayout from '@/components/category/CategoryLayout';
import { getByCategory, getCategories } from '@/lib/cms-client';
import { isSportsSite, navHrefForSlug } from '@/lib/competitions';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return { title: 'Categoria não encontrada', robots: { index: false, follow: false } };
  }

  // Prefer league hub URL when category slug maps to a competition page.
  const sportsHref =
    isSportsSite() && navHrefForSlug(slug) !== `/categoria/${slug}`
      ? navHrefForSlug(slug)
      : `/categoria/${slug}`;

  return pageMetadata({
    title: category.name,
    description: category.description ?? `Notícias de ${category.name} em ${siteConfig.siteName}`,
    path: sportsHref,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  if (isSportsSite()) {
    const sportsHref = navHrefForSlug(slug);
    if (sportsHref !== `/categoria/${slug}`) {
      redirect(sportsHref);
    }
  }
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  const articles = await getByCategory(slug, 20);

  return <CategoryLayout category={category} articles={articles} />;
}
