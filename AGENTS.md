# AGENTS.md

## Project overview
- This repository is a Hugo-powered personal site.
- The active theme is `hugo-bearcub` via Git submodule at `themes/hugo-bearcub`.
- Deploy target is Cloudflare (assets are served from `public/`) configured in `wrangler.jsonc`.

## Repository layout
- `content/`: site content (posts/pages).
- `content/blog/`: blog entries, mostly Markdown with TOML front matter.
- `layouts/`: site-level Hugo layout overrides.
- `assets/`: site-level assets processed by Hugo.
- `static/`: static files copied as-is by Hugo.
- `themes/hugo-bearcub/`: upstream theme submodule.
- `public/`: generated output (build artifact).
- `hugo.toml`: main Hugo configuration.
- `wrangler.jsonc`: Cloudflare deployment configuration.

## Working rules for agents
- Keep edits minimal and scoped to the user request.
- Do not hand-edit `public/`; regenerate it with Hugo when needed.
- Avoid changing `themes/hugo-bearcub/` unless explicitly requested (submodule-managed).
- Preserve existing front matter style: TOML (`+++`) and date format `YYYY-MM-DD`.
- For new blog posts, prefer placing files under `content/blog/`.
- Ignore local/editor metadata changes unless requested (for example `.DS_Store`, `.obsidian/` files).

## Local commands
- Preview locally (include drafts): `hugo server -D`
- Production build: `hugo --gc --minify`
- Clean rebuild (if output seems stale): `rm -rf public && hugo --gc --minify`

## Deployment notes
- `wrangler` is not guaranteed to be installed globally.
- Prefer one-off deploy via: `npx wrangler deploy`
- Ensure `public/` is freshly generated before deploying.

## Validation checklist before handoff
- Run `hugo --gc --minify` after content/layout/config changes.
- Confirm no Hugo build errors.
- If layout/styling changed, spot-check key pages from local server output.
