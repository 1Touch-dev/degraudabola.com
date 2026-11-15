import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PREFERRED_HOST = "degraudabola.com";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = (request.headers.get("host") || url.host || "")
    .toLowerCase()
    .replace(/:\d+$/, "");

  let shouldRedirect = false;

  // Prefer HTTPS + non-WWW (skip localhost / preview hosts).
  const isLocal =
    host === "localhost" ||
    host.startsWith("127.0.0.1") ||
    host.endsWith(".local") ||
    host.includes("vercel.app") ||
    host.includes("netlify.app");

  if (!isLocal) {
    if (host === `www.${PREFERRED_HOST}`) {
      url.protocol = "https:";
      url.host = PREFERRED_HOST;
      shouldRedirect = true;
    } else if (host === PREFERRED_HOST && request.nextUrl.protocol === "http:") {
      url.protocol = "https:";
      shouldRedirect = true;
    }
  }

  // Normalize trailing slashes (except root) to match sitemap / canonicals.
  if (url.pathname.length > 1 && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.replace(/\/+$/, "");
    shouldRedirect = true;
  }

  if (shouldRedirect) {
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|og-image.jpg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)$).*)",
  ],
};
