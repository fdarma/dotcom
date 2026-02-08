# AGENTS.md

## Project overview
- This repository is an Astro-powered personal site deployed to Cloudflare.
- Bear Cub remains the visual source of truth through the git submodule at `themes/hugo-bearcub`.
- Content is authored in Markdown under `content/` and rendered by Astro routes/components.

## Repository layout
- `content/`: source content (home page + blog posts).
- `src/`: Astro app code (pages, layouts, components, libs).
- `src/config/site.ts`: site-level metadata and formatting helpers.
- `src/lib/content.ts`: content loading/parsing + nav/tag/post indexes.
- `scripts/normalize-content.mjs`: auto-fixes malformed/missing blog front matter.
- `scripts/generate-redirects.mjs`: generates `public/_redirects` from legacy URLs.
- `public/`: static assets copied into build output (`dist/`).
- `themes/hugo-bearcub/`: Bear Cub submodule assets used by Astro imports.
- `wrangler.jsonc`: Cloudflare deployment config.

## Working rules for agents
- Keep edits minimal and scoped to the request.
- Do not edit `dist/` by hand; treat it as generated output.
- Do not modify `themes/hugo-bearcub/` unless explicitly requested.
- Preserve markdown content and front matter values unless a request requires changes.
- Keep legacy URL support intact by regenerating `_redirects` when routes/content change.

## Local commands
- Install deps: `pnpm install`
- Start dev server: `pnpm dev`
- Normalize content only: `pnpm run normalize:content`
- Regenerate redirects only: `pnpm run generate:redirects`
- Production build: `pnpm build`
- Preview build: `pnpm preview`
- Type checks: `pnpm check`
- Deploy: `pnpm deploy`

## Deployment notes
- Cloudflare assets directory is `dist/`.
- `pnpm deploy` runs build and then `wrangler deploy`.
- Keep `public/images/favicon.png` and `public/images/share.webp` present for metadata and favicon.

## Validation checklist before handoff
- Run `pnpm build` and ensure no errors.
- Run `pnpm check` for Astro/type validation.
- Confirm key routes: `/`, `/blog/`, `/tags/`, `/index.xml`, `/blog/index.xml`, `/tags/index.xml`, `/sitemap.xml`, `/robots.txt`.
- Spot-check one post page and one tag page for date/tag/byline/reply-link behavior.
