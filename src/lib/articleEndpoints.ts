/** Classification endpoints from docs/article-endpoints.md. HomePage is the homepage feed. */

export interface IArticleEndpoint {
  name: string;
  slug: string;
  endpoint: string;
}

export const articleEndpoints: IArticleEndpoint[] = [
  { name: 'Série B', slug: 'serie-b', endpoint: 'Série B' },
  { name: 'Acesso', slug: 'acesso', endpoint: 'Acesso' },
  { name: 'Rebaixamento', slug: 'rebaixamento', endpoint: 'Rebaixamento' },
  { name: 'Brasileirão', slug: 'brasileirao', endpoint: 'Brasileirão' },
  { name: 'Copa do Brasil', slug: 'copa-do-brasil', endpoint: 'Copa do Brasil' },
  { name: 'Libertadores', slug: 'libertadores', endpoint: 'Libertadores' },
  { name: 'Seleção', slug: 'selecao', endpoint: 'Seleção' },
  { name: 'Clubes', slug: 'clubes', endpoint: 'Clubes' },
  { name: 'Regional', slug: 'regional', endpoint: 'Regional' },
  { name: 'Calendário', slug: 'calendario', endpoint: 'Calendário' },
  { name: 'Resultados', slug: 'resultados', endpoint: 'Resultados' },
  { name: 'Tabela', slug: 'tabela', endpoint: 'Tabela' },
  { name: 'Transferências', slug: 'transferencias', endpoint: 'Transferências' },
  { name: 'Partidas', slug: 'partidas', endpoint: 'Partidas' },
  { name: 'Jogadores', slug: 'jogadores', endpoint: 'Jogadores' },
  { name: 'Notícias', slug: 'noticias', endpoint: 'Notícias' },
  { name: 'Outros', slug: 'other', endpoint: 'other' },
];

const bySlug = new Map(articleEndpoints.map((item) => [item.slug, item]));

export const HOME_ARTICLE_ENDPOINT = 'HomePage';

export const articleEndpointSlugSet = new Set(articleEndpoints.map((item) => item.slug));

export const endpointNameForSlug = (slug: string): string | undefined =>
  bySlug.get(slug)?.endpoint;

export const slugForEndpointName = (name: string): string | undefined => {
  const normalized = name.trim().toLowerCase();
  return articleEndpoints.find((item) => item.endpoint.toLowerCase() === normalized)?.slug;
};
