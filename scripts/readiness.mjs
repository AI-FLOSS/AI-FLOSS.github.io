#!/usr/bin/env node
// Rescores every Awesome AI-FLOSS entry with the ai-readiness package and writes src/data/readiness.json.
// A repository that fails to score keeps its previous result.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { score } from 'ai-readiness';

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

const results = {};
for (const { repo } of JSON.parse(readFileSync(AWESOME, 'utf8'))) {
	try {
		results[repo] = await score(repo, { token });
		console.error(`${repo}: ${results[repo].score}/4`);
	} catch (err) {
		console.error(`${repo}: ${err.message}`);
		if (previous[repo]) results[repo] = previous[repo];
	}
}
writeFileSync(RESULTS, JSON.stringify(results, null, '\t') + '\n');
