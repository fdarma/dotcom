import path from 'node:path';

export interface FrontmatterContext {
  filePath: string;
  isPost: boolean;
  mtime: Date;
}

export interface NormalizedFrontmatter {
  title: string;
  date: Date;
  description: string;
  tags: string[];
  menu?: string;
  weight?: number;
  author?: string;
  hideReply: boolean;
  link?: string;
  slug?: string;
  images: string[];
  style?: string;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  return undefined;
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => asString(item))
      .filter((item): item is string => Boolean(item));
  }

  const single = asString(value);
  return single ? [single] : [];
}

function parseDateValue(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.valueOf())) {
      return parsed;
    }
  }

  return undefined;
}

function inferTitleFromFilename(filePath: string): string {
  const filename = path.basename(filePath, path.extname(filePath));
  return filename.replace(/[-_]+/g, ' ').trim() || 'untitled';
}

export function normalizeFrontmatter(
  value: Record<string, unknown>,
  context: FrontmatterContext
): NormalizedFrontmatter {
  const title = asString(value.title) ?? inferTitleFromFilename(context.filePath);
  const parsedDate = parseDateValue(value.date) ?? context.mtime;

  return {
    title,
    date: parsedDate,
    description: asString(value.description) ?? '',
    tags: asStringArray(value.tags).map((tag) => tag.toLowerCase()),
    menu: asString(value.menu),
    weight: asNumber(value.weight),
    author: asString(value.author),
    hideReply: asBoolean(value.hideReply) ?? false,
    link: asString(value.link),
    slug: asString(value.slug),
    images: asStringArray(value.images),
    style: asString(value.style)
  };
}
