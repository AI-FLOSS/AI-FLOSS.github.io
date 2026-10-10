# Instructions for AI agents

This repository is the AI-FLOSS website, built with Astro Starlight as a static site.

- Page content lives in `src/content/docs/` as MDX; the frontmatter `title` is the page heading, so do not add an H1.
- The sidebar is set in `astro.config.mjs`; guideline pages are ordered by `sidebar.order` in their frontmatter.
- Prefer Markdown and Starlight's built-in components; do not add dependencies without a clear need.
- Keep the wording plain and the claims honest; do not invent statistics, members or partners.
- Every Awesome AI-FLOSS entry needs a link to the maintainers' own evidence of AI use.
- Run `npm run build` and make sure it succeeds before proposing a change.
- In the pull request, state which parts were written or changed by AI.
