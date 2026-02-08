import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';

export const prerender = true;

export const GET: APIRoute = async () => {
  const body = ['User-agent: *', 'Allow: /', `Sitemap: ${absoluteUrl('/sitemap.xml')}`, ''].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  });
};
