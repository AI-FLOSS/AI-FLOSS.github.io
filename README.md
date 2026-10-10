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

## Testing

`npm test` checks that every Awesome AI-FLOSS entry is complete and has a readiness score. CI runs
the tests, the build and an internal link check on every pull request, and Claude reviews each pull
request when the `ANTHROPIC_API_KEY` secret is set.

## Contributing

AI-assisted contributions are welcome. Read [AGENTS.md](AGENTS.md) before you or your agent start,
and say in the pull request how AI was involved.

To suggest a project for Awesome AI-FLOSS, add it to `src/data/awesome.json` and follow the
criteria on that page.

## AI Readiness Score

Scores come from the [ai-readiness](https://github.com/AI-FLOSS/ai-readiness) package.
`npm run readiness` rescores the whole list into `src/data/readiness.json`, and the deploy workflow
does the same on every build and once a week.

## Licence

Code is licensed under the [MIT licence](LICENSE). Written content in `src/content/` is licensed
under [CC BY-SA 4.0](LICENSE-docs).
