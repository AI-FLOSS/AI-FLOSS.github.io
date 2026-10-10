# AI-FLOSS website

Source for <https://ai-floss.github.io>, the home page of the AI-FLOSS community.

Built with [Astro Starlight](https://starlight.astro.build). Pages are MDX files in
`src/content/docs/`, and the sidebar is set in `astro.config.mjs`.

## Develop

```sh
npm install
npm run dev     # live preview at http://localhost:4321
npm run build   # static site in dist/, with the search index
```

Pushes to `main` build and deploy to GitHub Pages through `.github/workflows/deploy.yml`.

## Contributing

AI-assisted contributions are welcome. Read [AGENTS.md](AGENTS.md) before you or your agent start,
and say in the pull request how AI was involved.

To suggest a project for Awesome AI-FLOSS, add it to `src/data/awesome.json` and follow the
criteria on that page.

## AI Readiness Score

`node scripts/readiness.mjs owner/repo` scores any GitHub repository, and
`node scripts/readiness.mjs --awesome` rescores the whole list into `src/data/readiness.json`. The
deploy workflow also rescores the list on every build and once a week.
