import { NextRequest } from 'next/server';

// Simple whitelist to avoid SSRF; adjust as needed
const ALLOWED_HOSTS = new Set<string>([
  '127.0.0.1:8000',
  'localhost:8000',
]);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const target = searchParams.get('url');
    if (!target) {
      return new Response('Missing url parameter', { status: 400 });
    }

    const targetUrl = new URL(target);
    if (!ALLOWED_HOSTS.has(targetUrl.host)) {
      return new Response('Host not allowed', { status: 403 });
    }

    // Forward the request server-side (bypasses browser CORS)
    const upstream = await fetch(targetUrl.toString(), {
      method: 'GET',
      // Add auth headers here if your media endpoint is protected
      // headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => 'Upstream error');
      return new Response(text, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/pdf';
    const body = upstream.body as ReadableStream<Uint8Array> | null;

    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        // Allow the browser to consume the proxied resource
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    return new Response(`Proxy error: ${e?.message || 'unknown'}`, { status: 500 });
  }
}
