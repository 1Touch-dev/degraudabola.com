import type { Metadata } from 'next';
import SearchLayout from '@/components/search/SearchLayout';
import { search } from '@/lib/cms-client';
import { pageMetadata } from '@/lib/seo';
import { siteConfig } from '@/lib/site-config';

// Canonical is /busca without query params (search queries are not indexable URLs).
export const metadata: Metadata = pageMetadata({
  title: 'Busca',
  description: `Busque notícias em ${siteConfig.siteName}`,
  path: '/busca',
  noIndex: true,
});

interface BuscaPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const { q } = await searchParams;
  const query = q?.trim() ?? '';
  const results = query ? await search(query) : [];

  return <SearchLayout query={query} results={results} />;
}
