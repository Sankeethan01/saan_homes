import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function handleRequest(
  request: NextRequest,
  { path }: { path: string[] }
) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  const pathString = path.join('/');
  const targetUrl = new URL(
    pathString.startsWith('/') ? pathString : `/${pathString}`,
    apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl
  );

  console.log(`Proxying ${request.method} request to:`, targetUrl.toString());

  try {
    let body;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        body = await request.text();
      } catch (e) {
        console.error('Error reading request body:', e);
      }
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        ...Object.fromEntries(request.headers.entries()),
        host: targetUrl.host,
        referer: targetUrl.toString(),
      },
      body: body || null,
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        data = { error: 'Invalid JSON response' };
      }
    } else {
      data = await response.text();
    }

    return NextResponse.json(data, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': 'application/json',
        ...Object.fromEntries(response.headers.entries()),
      },
    });
  } catch (error) {
    console.error('API Route error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        message: error instanceof Error ? error.message : 'Unknown error',
        url: targetUrl.toString()
      },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return handleRequest(request, params);
}
