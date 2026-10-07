import { siteConfig } from '@/lib/site-config';

export type UnsubscribeResult = 'unsubscribed' | 'already' | 'missing' | 'not-found' | 'failed';

const APEX = 'degraudabola.com';

const apiBase = (
  process.env.NEXT_PUBLIC_NEWSLETTER_API_BASE ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  siteConfig.cms.baseUrl
).replace(/\/$/, '');

const bodyMessage = (body: unknown): string => {
  if (typeof body === 'string') return body;
  if (!body || typeof body !== 'object') return '';
  if ('message' in body && body.message) return String(body.message);
  if ('errors' in body && Array.isArray(body.errors)) {
    const first = body.errors[0];
    if (first && typeof first === 'object' && 'msg' in first && first.msg) return String(first.msg);
  }
  return '';
};

export const unsubscribeNewsletter = async (email: string, website = APEX): Promise<UnsubscribeResult> => {
  const trimmedEmail = email.trim();
  const trimmedWebsite = website.trim();
  if (!trimmedEmail || !trimmedWebsite || !apiBase) return 'missing';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const url = new URL(`${apiBase}/subscriptions/unsubscribe`);
    url.searchParams.set('email', trimmedEmail);
    url.searchParams.set('website', trimmedWebsite);
    const res = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    let body: unknown = null;
    try {
      const text = (await res.text()).trim();
      body = text ? (JSON.parse(text) as unknown) : null;
    } catch {
      body = null;
    }
    const message = bodyMessage(body);
    if (res.ok) return 'unsubscribed';
    if (res.status === 404) return 'not-found';
    if (res.status === 400 && /already\s*unsubscribed/i.test(message)) return 'already';
    if (res.status === 400 && /required/i.test(message)) return 'missing';
    return 'failed';
  } catch {
    return 'failed';
  } finally {
    clearTimeout(timer);
  }
};
