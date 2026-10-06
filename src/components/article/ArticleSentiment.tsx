'use client';

import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site-config';

const APEX = 'degraudabola.com';
const ANON_KEY = 'db-reader-id';
const SENT_KEY = 'db-sentiment-sent';
const MAX_PAGES = 10;

const reactions = [
  { name: 'like', label: 'Like' },
  { name: 'love', label: 'Amei' },
  { name: 'haha', label: 'Haha' },
  { name: 'wow', label: 'Uau' },
  { name: 'sad', label: 'Triste' },
  { name: 'angry', label: 'Raiva' },
  { name: 'dislike', label: 'Não gostei' },
] as const;

const labelCopy: Record<string, string> = {
  positive: 'Positivo',
  neutral: 'Neutro',
  negative: 'Negativo',
};

interface ISentimentEvent {
  sourceType: string;
  sourceId: string;
  status: string;
  createdAt: string;
  slug: string;
  text: string;
  label: string;
  reaction: string;
  rating: number;
}

interface IArticleSentimentProps {
  articleId: string;
  slug: string;
  tone?: 'dark' | 'light';
}

interface ISentimentPayload {
  website: string;
  sourceType: 'comment' | 'like' | 'reaction' | 'rating';
  sourceId: string;
  path: string;
  articleId: string;
  language: 'pt-BR';
  metadata: {
    slug: string;
    path: string;
    articleId: string;
    text?: string;
    reaction?: string;
    rating?: number;
  };
}

const cmsBase = () => (siteConfig.cms.baseUrl || '').replace(/\/$/, '');

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

const readerId = () => {
  const existing = localStorage.getItem(ANON_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(ANON_KEY, created);
  return created;
};

const readSent = () => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SENT_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const rememberSent = (sourceId: string) => {
  const next = [...new Set([...readSent(), sourceId])];
  localStorage.setItem(SENT_KEY, JSON.stringify(next));
};

const eventText = (metadata: Record<string, unknown>) =>
  asString(metadata.text) || asString(metadata.comment) || asString(metadata.body) || asString(metadata.message);

const toEvent = (value: unknown): ISentimentEvent | null => {
  if (!isRecord(value)) return null;
  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const analysis = isRecord(value.analysis) ? value.analysis : {};
  const rating = typeof metadata.rating === 'number' ? metadata.rating : Number(metadata.rating);
  return {
    sourceType: asString(value.sourceType),
    sourceId: asString(value.sourceId),
    status: asString(value.status),
    createdAt: asString(value.createdAt) || asString(value.eventTimestamp),
    slug: asString(metadata.slug),
    text: eventText(metadata),
    label: asString(analysis.overallLabel),
    reaction: asString(metadata.reaction),
    rating: Number.isFinite(rating) ? rating : 0,
  };
};

const rawMatches = (value: unknown, slug: string) => {
  if (!isRecord(value)) return false;
  const metadata = isRecord(value.metadata) ? value.metadata : {};
  const sourceId = asString(value.sourceId);
  return asString(metadata.slug) === slug || sourceId.startsWith(`${slug}:`);
};

const ArticleSentiment = ({ articleId, slug, tone = 'light' }: IArticleSentimentProps) => {
  const path = `/artigo/${slug}`;
  const dark = tone === 'dark';
  const [events, setEvents] = useState<ISentimentEvent[]>([]);
  const [pendingComments, setPendingComments] = useState<ISentimentEvent[]>([]);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState('');
  const [anon, setAnon] = useState('');
  const [pickedRating, setPickedRating] = useState(0);

  useEffect(() => {
    setAnon(readerId());
    setSentIds(readSent());
    let cancelled = false;

    const load = async () => {
      const matched: ISentimentEvent[] = [];
      let page = 1;
      let totalPages = 1;

      while (page <= totalPages && page <= MAX_PAGES) {
        const params = new URLSearchParams({
          website: APEX,
          status: 'completed',
          limit: '100',
          page: String(page),
        });
        const response = await fetch(`${cmsBase()}/sentiment/events?${params.toString()}`);
        if (!response.ok) break;
        const payload: unknown = await response.json();
        const record = isRecord(payload) ? payload : {};
        const batch = Array.isArray(record.events) ? record.events : [];
        batch.forEach((item) => {
          if (!rawMatches(item, slug)) return;
          const event = toEvent(item);
          if (event) matched.push(event);
        });
        totalPages = typeof record.totalPages === 'number' ? record.totalPages : 1;
        page += 1;
      }

      if (!cancelled) setEvents(matched);
    };

    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const counts = events.reduce(
    (total, event) => {
      if (event.label === 'positive') total.positive += 1;
      if (event.label === 'neutral') total.neutral += 1;
      if (event.label === 'negative') total.negative += 1;
      return total;
    },
    { positive: 0, neutral: 0, negative: 0 }
  );

  const postEvent = async (payload: ISentimentPayload) => {
    const response = await fetch(`${cmsBase()}/sentiment/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.status === 201) return 'created' as const;
    if (response.status === 400) return 'invalid' as const;
    return 'error' as const;
  };

  const basePayload = (
    sourceType: ISentimentPayload['sourceType'],
    sourceId: string,
    metadata: ISentimentPayload['metadata']
  ): ISentimentPayload => ({
    website: APEX,
    sourceType,
    sourceId,
    path,
    articleId,
    language: 'pt-BR',
    metadata,
  });

  const submitComment = async () => {
    const text = comment.trim();
    if (!text || busy) return;
    const sourceId = `${slug}:comment:${crypto.randomUUID()}`;
    setBusy('comment');
    setMessage('');
    let result: 'created' | 'invalid' | 'error' = 'error';
    try {
      result = await postEvent(
        basePayload('comment', sourceId, { slug, path, articleId, text })
      );
    } catch {
      result = 'error';
    }
    setBusy('');
    if (result === 'invalid') {
      setMessage('Não foi possível enviar o comentário.');
      return;
    }
    if (result !== 'created') {
      setMessage('Não foi possível enviar agora. Tente de novo.');
      return;
    }
    setPendingComments((current) => [
      {
        sourceType: 'comment',
        sourceId,
        status: 'pending',
        createdAt: new Date().toISOString(),
        slug,
        text,
        label: '',
        reaction: '',
        rating: 0,
      },
      ...current,
    ]);
    setComment('');
  };

  const sendStable = async (
    sourceType: ISentimentPayload['sourceType'],
    sourceId: string,
    metadata: ISentimentPayload['metadata'],
    token: string
  ) => {
    if (busy || sentIds.includes(sourceId)) return false;
    setBusy(token);
    setMessage('');
    let result: 'created' | 'invalid' | 'error' = 'error';
    try {
      result = await postEvent(basePayload(sourceType, sourceId, metadata));
    } catch {
      result = 'error';
    }
    setBusy('');
    if (result === 'invalid') {
      setMessage('Não foi possível registrar.');
      return false;
    }
    if (result !== 'created') {
      setMessage('Não foi possível registrar agora. Tente de novo.');
      return false;
    }
    rememberSent(sourceId);
    setSentIds((current) => [...current, sourceId]);
    return true;
  };

  const likeId = anon ? `${slug}:like:${anon}` : '';
  const ratingId = anon ? `${slug}:rating:${anon}` : '';
  const liked = Boolean(likeId && (sentIds.includes(likeId) || events.some((event) => event.sourceId === likeId)));
  const rated = events.find((event) => event.sourceType === 'rating' && event.sourceId === ratingId);
  const savedRating = pickedRating || rated?.rating || 0;
  const ratingLocked = Boolean(savedRating);
  const comments = [
    ...pendingComments,
    ...events
      .filter((event) => event.sourceType === 'comment' && event.slug === slug && event.text)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  ];
  const chip = dark
    ? 'border border-white/20 bg-white/5 text-white'
    : 'border border-black/15 bg-white text-secondary';
  const chipOn = 'border border-accent bg-accent text-white';

  return (
    <section
      className={`mt-10 border-t pt-6 ${dark ? 'border-white/15' : 'border-black/10'}`}
      aria-labelledby="sentiment-heading"
    >
      <h2 id="sentiment-heading" className="font-display text-2xl">
        Reação dos leitores
      </h2>
      {events.length > 0 ? (
        <p className={`mt-3 text-sm ${dark ? 'text-white/70' : 'text-muted'}`}>
          Positivas {counts.positive} · Neutras {counts.neutral} · Negativas {counts.negative}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={`min-h-11 px-3 text-xs font-semibold uppercase tracking-wide ${liked ? chipOn : chip}`}
          aria-pressed={liked}
          disabled={!anon || busy === 'like' || liked}
          onClick={() =>
            sendStable('like', likeId, { slug, path, articleId, reaction: 'like' }, 'like')
          }
        >
          Curtir
        </button>
        {reactions.map((reaction) => {
          const sourceId = anon ? `${slug}:reaction:${reaction.name}:${anon}` : '';
          const active = Boolean(
            sourceId && (sentIds.includes(sourceId) || events.some((event) => event.sourceId === sourceId))
          );
          return (
            <button
              key={reaction.name}
              type="button"
              className={`min-h-11 px-3 text-xs font-semibold uppercase ${active ? chipOn : chip}`}
              aria-pressed={active}
              disabled={!anon || busy === reaction.name || active}
              onClick={() =>
                sendStable(
                  'reaction',
                  sourceId,
                  { slug, path, articleId, reaction: reaction.name },
                  reaction.name
                )
              }
            >
              {reaction.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Nota">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            className={`h-11 w-11 text-sm font-semibold ${savedRating === score ? chipOn : chip}`}
            aria-pressed={savedRating === score}
            disabled={!anon || busy === 'rating' || ratingLocked}
            onClick={() => {
              sendStable('rating', ratingId, { slug, path, articleId, rating: score }, 'rating')
                .then((created) => {
                  if (created) setPickedRating(score);
                })
                .catch(() => setMessage('Não foi possível registrar agora. Tente de novo.'));
            }}
          >
            {score}
          </button>
        ))}
      </div>
      <form
        className="mt-6 grid gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          submitComment().catch(() => setMessage('Não foi possível enviar agora. Tente de novo.'));
        }}
      >
        <label htmlFor={`comment-${slug}`} className="text-sm font-semibold">
          Comentário
        </label>
        <textarea
          id={`comment-${slug}`}
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          className={`w-full px-3 py-2 text-sm outline-none focus:border-accent ${
            dark
              ? 'border border-white/20 bg-white/5 text-white'
              : 'border border-black/20 bg-white text-foreground'
          }`}
        />
        <button
          type="submit"
          disabled={busy === 'comment' || !comment.trim()}
          className="w-fit bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white disabled:opacity-70"
        >
          {busy === 'comment' ? 'Enviando…' : 'Publicar'}
        </button>
      </form>
      {message ? (
        <p role="alert" className="mt-2 text-sm text-accent">
          {message}
        </p>
      ) : null}
      {comments.length > 0 ? (
        <ul className="mt-6 grid gap-3">
          {comments.map((item) => (
            <li key={item.sourceId} className={`p-3 text-sm ${chip}`}>
              <p>{item.text}</p>
              {item.status === 'completed' && labelCopy[item.label] ? (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
                  {labelCopy[item.label]}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
};

export default ArticleSentiment;
