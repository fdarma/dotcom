import type { APIRoute } from 'astro';
import { siteConfig } from '../../config/site';
import { getPosts } from '../../lib/content';
import { buildRssXml } from '../../lib/rss';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const rss = buildRssXml({
    title: `blog on ${siteConfig.title}`,
    description: `Recent content in blog on ${siteConfig.title}`,
    path: '/blog/index.xml',
    posts
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
