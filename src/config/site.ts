export const siteConfig = {
  baseUrl: 'https://fdarma.com',
  title: 'fdarma',
  description: '|¦ꒉ[▓▓]',
  copyright: 'fdarma',
  dateFormat: 'YYYY-MM-DD',
  languageCode: 'en-US',
  favicon: '/images/favicon.png',
  defaultSocialImage: '/images/share.webp',
  madeWith: '(¦ꒉ[▓▓]',
  social: {
    twitter: 'example',
    facebookAdmin: '0000000000'
  },
  author: {
    name: 'fdarma',
    email: 'arroganttramps@gmail.com'
  }
} as const;

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalized = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
  return new URL(normalized, siteConfig.baseUrl).toString();
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC'
  }).format(date);
}
