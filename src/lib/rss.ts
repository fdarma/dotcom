import { absoluteUrl, siteConfig } from '../config/site';
import type { BlogPost } from './content';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRssDate(date: Date): string {
  return date.toUTCString();
}

export function buildRssXml(options: {
  title: string;
  description: string;
  path: string;
  posts: BlogPost[];
}): string {
  const { title, description, path, posts } = options;
  const channelUrl = absoluteUrl(path);
  const latestDate = posts[0]?.date ?? new Date();

  const items = posts
    .map((post) => {
      const authorName = post.author ?? siteConfig.author.name;
      const authorLine = siteConfig.author.email
        ? `<author>${escapeXml(siteConfig.author.email)} (${escapeXml(authorName)})</author>`
        : '';
      const descriptionText = post.description || post.summary;

      return [
        '<item>',
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(absoluteUrl(post.url))}</link>`,
        `<pubDate>${toRssDate(post.date)}</pubDate>`,
        authorLine,
        `<guid>${escapeXml(absoluteUrl(post.url))}</guid>`,
        `<description>${escapeXml(descriptionText)}</description>`,
        `<content:encoded><![CDATA[${post.html}]]></content:encoded>`,
        '</item>'
      ]
        .filter(Boolean)
        .join('');
    })
    .join('');

  return [
    '<?xml version="1.0" encoding="utf-8" standalone="yes"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    '<channel>',
    `<title>${escapeXml(title)}</title>`,
    `<link>${escapeXml(channelUrl)}</link>`,
    `<description>${escapeXml(description)}</description>`,
    '<generator>Astro</generator>',
    `<language>${escapeXml(siteConfig.languageCode)}</language>`,
    siteConfig.author.email
      ? `<managingEditor>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</managingEditor>`
      : '',
    siteConfig.author.email
      ? `<webMaster>${escapeXml(siteConfig.author.email)} (${escapeXml(siteConfig.author.name)})</webMaster>`
      : '',
    `<copyright>${escapeXml(siteConfig.copyright)}</copyright>`,
    `<lastBuildDate>${toRssDate(latestDate)}</lastBuildDate>`,
    `<atom:link href="${escapeXml(channelUrl)}" rel="self" type="application/rss+xml" />`,
    items,
    '</channel>',
    '</rss>'
  ]
    .filter(Boolean)
    .join('');
}
