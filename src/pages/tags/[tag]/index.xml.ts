import type { APIRoute } from 'astro';
import { siteConfig } from '../../../config/site';
import { getPostsByTag, getTagNames } from '../../../lib/content';
import { buildRssXml } from '../../../lib/rss';

export const prerender = true;

export async function getStaticPaths() {
  const tags = await getTagNames();
  return tags.map((tag) => ({ params: { tag } }));
}

export const GET: APIRoute = async ({ params }) => {
  const tag = String(params.tag).toLowerCase();
  const posts = await getPostsByTag(tag);
  const rss = buildRssXml({
    title: `${tag} on ${siteConfig.title}`,
    description: `Recent content tagged ${tag} on ${siteConfig.title}`,
    path: `/tags/${tag}/index.xml`,
    posts
  });

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8'
    }
  });
};
