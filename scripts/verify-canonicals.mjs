/**
 * Validate canonical tags in rendered HTML from a running Next server.
 * Usage: node scripts/verify-canonicals.mjs [baseUrl]
 */
const base = (process.argv[2] || "http://127.0.0.1:3000").replace(/\/$/, "");
const preferredHost = "https://degraudabola.com";

const checks = [
  { path: "/", expect: `${preferredHost}` },
  { path: "/news", expect: `${preferredHost}/news` },
  { path: "/news?utm_source=audit", expect: `${preferredHost}/news` },
  { path: "/futebol", expect: `${preferredHost}/futebol` },
  { path: "/liga/serie-b", expect: `${preferredHost}/liga/serie-b` },
  { path: "/about", expect: `${preferredHost}/about` },
  { path: "/busca?q=test&utm_source=x", expect: `${preferredHost}/busca` },
  { path: "/categoria/acesso", expect: `${preferredHost}/categoria/acesso` },
];

function extractCanonicals(html) {
  const matches = [...html.matchAll(/<link[^>]*rel=["']canonical["'][^>]*>/gi)];
  return matches
    .map((m) => {
      const href = m[0].match(/href=["']([^"']+)["']/i);
      return href?.[1] || null;
    })
    .filter(Boolean);
}

async function check({ path, expect }) {
  const res = await fetch(`${base}${path}`, {
    headers: { Accept: "text/html" },
  });
  const html = await res.text();
  const canonicals = extractCanonicals(html);
  const ok = res.ok && canonicals.length === 1 && canonicals[0] === expect;
  return {
    path,
    status: res.status,
    canonicals,
    expect,
    ok,
  };
}

const results = [];
for (const item of checks) {
  try {
    results.push(await check(item));
  } catch (err) {
    results.push({ path: item.path, ok: false, error: String(err) });
  }
}

console.log(JSON.stringify({ base, results }, null, 2));
const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\n${failed.length} check(s) failed`);
  process.exit(1);
}
console.log(`\nAll ${results.length} canonical checks passed`);
