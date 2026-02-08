import type { APIRoute } from 'astro';
import { absoluteUrl } from '../config/site';
import { getPosts, getSitemapUrls, getTagNames } from '../lib/content';

export const prerender = true;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async () => {
  const [posts, tags, urls] = await Promise.all([getPosts(), getTagNames(), getSitemapUrls()]);

  const postLastmod = new Map(posts.map((post) => [post.url, post.date.toISOString()]));
  const tagLastmod = new Map(
    tags.map((tag) => {
      const latest = posts.find((post) => post.tags.includes(tag));
      return [`/tags/${tag}/`, latest?.date.toISOString()];
    })
  );

  const entries = urls
    .sort((a, b) => a.localeCompare(b))
    .map((url) => {
      const lastmod = postLastmod.get(url) ?? tagLastmod.get(url);
      return [
        '<url>',
        `<loc>${escapeXml(absoluteUrl(url))}</loc>`,
        lastmod ? `<lastmod>${escapeXml(lastmod)}</lastmod>` : '',
        '</url>'
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries,
    '</urlset>'
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
};
