import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleLayout from '@/components/article/ArticleLayout';
import { getArticleBySlug, getByCategory } from '@/lib/cms-client';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: 'Artigo não encontrado', robots: { index: false, follow: false } };
  }

  return pageMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/artigo/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    image: article.imageUrl || siteConfig.seo.defaultOgImage,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = (await getByCategory(article.categorySlug, 4))
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return <ArticleLayout article={article} related={related} />;
}
