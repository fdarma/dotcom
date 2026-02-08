import type { APIRoute } from 'astro';
import { siteConfig } from '../../config/site';
import { getPosts } from '../../lib/content';
import { buildRssXml } from '../../lib/rss';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const rss = buildRssXml({
    title: `tags on ${siteConfig.title}`,
    description: `Recent tagged content on ${siteConfig.title}`,
    path: '/tags/index.xml',
    posts,
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
