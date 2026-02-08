import fs from 'node:fs/promises';
import path from 'node:path';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

function toUtcDateString(date) {
  return date.toISOString().slice(0, 10);
}

function needsFrontmatter(raw) {
  return !(raw.startsWith('+++\n') || raw.startsWith('---\n') || raw.startsWith('+++\r\n') || raw.startsWith('---\r\n'));
}

function buildTomlFrontmatter({ title, date }) {
  return [
    '+++',
    `date = '${date}'`,
    `title = '${title.replace(/'/g, "\\'")}'`,
    'description = ""',
    'tags = []',
    '+++',
    ''
  ].join('\n');
}

async function normalizeFile(filePath) {
  const [raw, stat] = await Promise.all([fs.readFile(filePath, 'utf8'), fs.stat(filePath)]);
  let next = raw;

  if (next.startsWith('x+++')) {
    next = next.replace(/^x\+\+\+/, '+++');
  }

  if (needsFrontmatter(next)) {
    const title = path.basename(filePath, path.extname(filePath));
    const date = toUtcDateString(stat.mtime);
    next = `${buildTomlFrontmatter({ title, date })}${next}`;
  }

  if (next !== raw) {
    await fs.writeFile(filePath, next, 'utf8');
    return true;
  }

  return false;
}

async function run() {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(BLOG_DIR, entry.name));

  let changed = 0;
  for (const filePath of files) {
    if (await normalizeFile(filePath)) {
      changed += 1;
    }
  }

  process.stdout.write(`Normalized ${changed} file(s).\n`);
}

run().catch((error) => {
  process.stderr.write(`${error.stack || error}\n`);
  process.exitCode = 1;
});
