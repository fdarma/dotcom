import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import TOML from '@iarna/toml';
import MarkdownIt from 'markdown-it';
import { normalizeFrontmatter } from './frontmatter-normalize';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: false
});

export interface NavItem {
  name: string;
  url: string;
  weight: number;
}

export interface ContentPage {
  filePath: string;
  title: string;
  menu?: string;
  weight?: number;
  url: string;
  html: string;
  description: string;
}

export interface BlogPost {
  filePath: string;
  slug: string;
  title: string;
  date: Date;
  description: string;
  summary: string;
  tags: string[];
  url: string;
  html: string;
  author?: string;
  hideReply: boolean;
  link?: string;
  images: string[];
  style?: string;
}

interface SiteContent {
  homePage: ContentPage;
  blogPage: ContentPage;
  posts: BlogPost[];
  navItems: NavItem[];
  tags: Map<string, BlogPost[]>;
}

let cache: Promise<SiteContent> | null = null;

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-_]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

  return normalized || 'untitled';
}

function summarizeFromHtml(html: string, fallback = ''): string {
  const stripped = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const text = stripped || fallback;
  if (text.length <= 180) {
    return text;
  }

  return `${text.slice(0, 177).trim()}...`;
}

interface ParsedMatter {
  data: Record<string, unknown>;
  content: string;
}

function parseTomlFrontmatter(raw: string): ParsedMatter | null {
  if (!raw.startsWith('+++')) {
    return null;
  }

  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('+++\n')) {
    return null;
  }

  const end = normalized.indexOf('\n+++', 4);
  if (end === -1) {
    return null;
  }

  const frontmatter = normalized.slice(4, end);
  const trailing = normalized.slice(end + 4);
  const content = trailing.startsWith('\n') ? trailing.slice(1) : trailing;

  return {
    data: TOML.parse(frontmatter) as Record<string, unknown>,
    content
  };
}

function parseMatter(raw: string): ParsedMatter {
  const tomlParsed = parseTomlFrontmatter(raw);
  if (tomlParsed) {
    return tomlParsed;
  }

  const yamlParsed = matter(raw);
  return {
    data: (yamlParsed.data ?? {}) as Record<string, unknown>,
    content: yamlParsed.content ?? ''
  };
}

async function parsePage(filePath: string, url: string): Promise<ContentPage> {
  const [raw, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
  const parsed = parseMatter(raw);
  const frontmatter = normalizeFrontmatter(parsed.data as Record<string, unknown>, {
    filePath,
    isPost: false,
    mtime: stat.mtime
  });

  return {
    filePath,
    title: frontmatter.title,
    menu: frontmatter.menu,
    weight: frontmatter.weight,
    url,
    html: markdown.render(parsed.content),
    description: frontmatter.description
  };
}

async function parsePost(filePath: string): Promise<BlogPost> {
  const [raw, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
  const parsed = parseMatter(raw);
  const frontmatter = normalizeFrontmatter(parsed.data as Record<string, unknown>, {
    filePath,
    isPost: true,
    mtime: stat.mtime
  });

  const filename = path.basename(filePath, path.extname(filePath));
  const slug = frontmatter.slug ? slugify(frontmatter.slug) : slugify(filename);
  const html = markdown.render(parsed.content);
  const summary = frontmatter.description || summarizeFromHtml(html, frontmatter.title);

  return {
    filePath,
    slug,
    title: frontmatter.title,
    date: frontmatter.date,
    description: frontmatter.description,
    summary,
    tags: frontmatter.tags,
    url: `/blog/${slug}/`,
    html,
    author: frontmatter.author,
    hideReply: frontmatter.hideReply,
    link: frontmatter.link,
    images: frontmatter.images,
    style: frontmatter.style
  };
}

async function loadSiteContent(): Promise<SiteContent> {
  const homePagePath = path.join(CONTENT_DIR, '_index.md');
  const blogPagePath = path.join(BLOG_DIR, '_index.md');

  const [homePage, blogPage, blogEntries] = await Promise.all([
    parsePage(homePagePath, '/'),
    parsePage(blogPagePath, '/blog/'),
    fs.readdir(BLOG_DIR, { withFileTypes: true })
  ]);

  const postFiles = blogEntries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md') && entry.name !== '_index.md')
    .map((entry) => path.join(BLOG_DIR, entry.name));

  const posts = await Promise.all(postFiles.map((filePath) => parsePost(filePath)));
  posts.sort((a, b) => b.date.valueOf() - a.date.valueOf());

  const navItems: NavItem[] = [homePage, blogPage]
    .filter((page) => page.menu === 'main')
    .map((page) => ({
      name: page.title,
      url: page.url,
      weight: page.weight ?? Number.MAX_SAFE_INTEGER
    }))
    .sort((a, b) => a.weight - b.weight || a.name.localeCompare(b.name));

  const tags = new Map<string, BlogPost[]>();
  for (const post of posts) {
    for (const tag of post.tags) {
      const normalizedTag = tag.toLowerCase();
      const items = tags.get(normalizedTag) ?? [];
      items.push(post);
      tags.set(normalizedTag, items);
    }
  }

  for (const [, items] of tags) {
    items.sort((a, b) => b.date.valueOf() - a.date.valueOf());
  }

  return {
    homePage,
    blogPage,
    posts,
    navItems,
    tags
  };
}

async function getContent(): Promise<SiteContent> {
  if (!cache) {
    cache = loadSiteContent();
  }

  return cache;
}

export async function getHomePage(): Promise<ContentPage> {
  return (await getContent()).homePage;
}

export async function getBlogPage(): Promise<ContentPage> {
  return (await getContent()).blogPage;
}

export async function getPosts(): Promise<BlogPost[]> {
  return (await getContent()).posts;
}

export async function getPostBySlug(slug: string): Promise<BlogPost | undefined> {
  return (await getContent()).posts.find((post) => post.slug === slug);
}

export async function getMainNavItems(): Promise<NavItem[]> {
  return (await getContent()).navItems;
}

export async function getTagNames(): Promise<string[]> {
  return [...(await getContent()).tags.keys()].sort((a, b) => a.localeCompare(b));
}

export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  return (await getContent()).tags.get(tag.toLowerCase()) ?? [];
}

export async function getSitemapUrls(): Promise<string[]> {
  const [posts, tags] = await Promise.all([getPosts(), getTagNames()]);
  const urls = new Set<string>(['/', '/blog/', '/tags/', '/index.xml', '/blog/index.xml', '/tags/index.xml']);

  for (const post of posts) {
    urls.add(post.url);
  }

  for (const tag of tags) {
    urls.add(`/tags/${tag}/`);
    urls.add(`/tags/${tag}/index.xml`);
  }

  return [...urls];
}

export function invalidateContentCache(): void {
  cache = null;
}
