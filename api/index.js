// Vercel serverless function adapter
// This adapts the Cloudflare-style Web Fetch API handler (dist/server/server.js)
// to Vercel's Node.js serverless function signature.
import { createServer } from 'node:http';
import { Readable } from 'node:stream';

// Dynamically import the built server handler
let serverHandler = null;
async function getHandler() {
  if (!serverHandler) {
    const mod = await import('../dist/server/server.js');
    serverHandler = mod.default;
  }
  return serverHandler;
}

// Convert a Node.js IncomingMessage to a Web Request
async function nodeToWebRequest(req) {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost';
  const url = new URL(req.url, `${protocol}://${host}`);

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  const method = req.method || 'GET';
  const hasBody = method !== 'GET' && method !== 'HEAD';

  let body = undefined;
  if (hasBody) {
    body = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => resolve(Buffer.concat(chunks)));
      req.on('error', reject);
    });
  }

  return new Request(url.toString(), {
    method,
    headers,
    body: hasBody ? body : undefined,
  });
}

// Convert a Web Response to a Node.js ServerResponse
async function webResponseToNode(webResponse, res) {
  res.statusCode = webResponse.status;

  webResponse.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (webResponse.body) {
    const reader = webResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
  }
  res.end();
}

export default async function handler(req, res) {
  try {
    const server = await getHandler();
    const webRequest = await nodeToWebRequest(req);
    const webResponse = await server.fetch(webRequest, process.env, {});
    await webResponseToNode(webResponse, res);
  } catch (err) {
    console.error('[Vercel Adapter] Unhandled error:', err);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
