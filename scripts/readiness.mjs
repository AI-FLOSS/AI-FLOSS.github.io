#!/usr/bin/env node
// Rescores every Awesome AI-FLOSS entry and every AI-FLOSS repository with the ai-readiness package,
// and writes src/data/readiness.json.
// A repository that fails to score keeps its previous result.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { github, score } from 'ai-readiness';

const AWESOME = new URL('../src/data/awesome.json', import.meta.url);
const RESULTS = new URL('../src/data/readiness.json', import.meta.url);

const token =
	process.env.GITHUB_TOKEN ||
	(() => {
		try {
			return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
		} catch {
			return undefined;
		}
	})();

const previous = (() => {
	try {
		return JSON.parse(readFileSync(RESULTS, 'utf8'));
	} catch {
		return {};
	}
})();

// The organisation's own public repositories get scores and badges too.
const own = ((await github(token)('orgs/AI-FLOSS/repos?type=public&per_page=100')) ?? [])
	.filter((r) => !r.fork && !r.archived && r.name !== '.github')
	.map((r) => r.full_name);
const repos = [...new Set([...JSON.parse(readFileSync(AWESOME, 'utf8')).map((e) => e.repo), ...own])];

const results = {};
for (const repo of repos) {
	try {
		results[repo] = await score(repo, { token });
		console.error(`${repo}: ${results[repo].score}/${results[repo].total}`);
	} catch (err) {
		console.error(`${repo}: ${err.message}`);
		if (previous[repo]) results[repo] = previous[repo];
	}
}
writeFileSync(RESULTS, JSON.stringify(results, null, '\t') + '\n');
