#!/usr/bin/env node
// Scores GitHub repositories against the AI Readiness Score described in
// src/content/docs/guidelines/readiness.mdx.
//
//   node scripts/readiness.mjs owner/repo [owner/repo ...]   print scores
//   node scripts/readiness.mjs --awesome                     score every Awesome AI-FLOSS entry
//
// Uses GITHUB_TOKEN, or the token from `gh auth token` when it is unset.

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const AWESOME = new URL('../src/data/awesome.json', import.meta.url);
const RESULTS = new URL('../src/data/readiness.json', import.meta.url);

const token =
	process.env.GITHUB_TOKEN ||
	(() => {
		try {
			return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
		} catch {
			return '';
		}
	})();

async function api(path, { raw = false } = {}) {
	const res = await fetch(`https://api.github.com/${path}`, {
		headers: {
			Accept: raw ? 'application/vnd.github.raw' : 'application/vnd.github+json',
			...(token && { Authorization: `Bearer ${token}` }),
		},
	});
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
	return raw ? res.text() : res.json();
}

const AGENT_FILES = [
	/(^|\/)AGENTS\.md$/,
	/(^|\/)CLAUDE\.md$/,
	/(^|\/)GEMINI\.md$/,
	/^\.github\/copilot-instructions\.md$/,
	/^\.github\/instructions\/.+\.instructions\.md$/,
	/^\.cursorrules$/,
	/^\.cursor\/rules\//,
	/^\.windsurfrules$/,
	/^\.clinerules/,
];

const POLICY_FILES = [/(^|\/)AI[_-]?POLICY(\.md)?$/i, /(^|\/)(AI|LLM)[_-]?(USAGE|CONTRIBUTIONS?)\.md$/i];
const CONTRIBUTING = /^(\.github\/|docs\/)?CONTRIBUTING(\.md)?$/i;
const PR_TEMPLATE = /^(\.github\/|docs\/)?pull_request_template\.md$/i;
// A heading or checkbox about using AI, such as "## AI-assisted contributions" or "- [ ] Written with AI".
const AI_TERM = String.raw`(\bAI\b|\bLLMs?\b|[Aa]rtificial [Ii]ntelligence|[Gg]enerative|[Cc]oding agents?)`;
const AI_USE = String.raw`(polic|assist|generat|usage|use of|using|disclos|contribut|written|tool)`;
const AI_HEADING = new RegExp(
	String.raw`^(#{1,6}|\s*[-*] \[ \]).*(${AI_TERM}.*${AI_USE}|${AI_USE}.*${AI_TERM})`,
	'mi',
);

const TEST_FILES = [
	/(^|\/)(tests?|__tests__|spec|testing)\//,
	/_test\.(go|py|rs|exs|dart)$/,
	/\.(test|spec)\.[cm]?[jt]sx?$/,
	/(^|\/)test_[^/]+\.py$/,
	/Tests?\.(cs|java|kt|swift)$/,
];
// A workflow step that runs a test suite.
const TEST_COMMAND =
	/run:.*\b(test|tests|pytest|jest|vitest|nextest|ctest|tox|nox|rspec|phpunit|check)\b|uses:.*test/i;
const OTHER_CI = [/^\.circleci\//, /^\.buildkite\//, /^\.gitlab-ci\.yml$/, /^\.travis\.yml$/, /^\.cirrus\.yml$/, /^\.woodpecker/];

const REVIEW_FILES = [/^\.coderabbit\.ya?ml$/, /^\.gemini\/config\.ya?ml$/, /^\.sourcery\.ya?ml$/, /^\.pr_agent\.toml$/, /^greptile\.json$/];
const REVIEW_ACTIONS =
	/anthropics\/claude-code-action|openai\/codex-action|run-gemini-cli|coderabbitai\/|pr-agent|sourcery-ai\/|ai-code-review/i;
const REVIEW_BOTS = new Set([
	'coderabbitai[bot]',
	'copilot-pull-request-reviewer[bot]',
	'Copilot',
	'claude[bot]',
	'gemini-code-assist[bot]',
	'sourcery-ai[bot]',
	'qodo-merge-pro[bot]',
	'greptile-apps[bot]',
	'cursor[bot]',
	'chatgpt-codex-connector[bot]',
	'ellipsis-dev[bot]',
]);

const find = (paths, patterns) => paths.find((p) => patterns.some((re) => re.test(p)));

export async function score(slug) {
	const repo = await api(`repos/${slug}`);
	if (!repo) throw new Error(`${slug}: repository not found`);
	const tree = await api(`repos/${slug}/git/trees/${repo.default_branch}?recursive=1`);
	const paths = tree.tree.map((e) => e.path);
	const read = (path) => api(`repos/${slug}/contents/${encodeURI(path)}`, { raw: true });

	const workflowPaths = paths.filter((p) => /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p)).slice(0, 30);
	const workflows = await Promise.all(workflowPaths.map(async (p) => [p, (await read(p)) ?? '']));

	// 1. A written AI usage policy.
	let policy = find(paths, POLICY_FILES);
	for (const p of paths.filter((p) => CONTRIBUTING.test(p) || PR_TEMPLATE.test(p))) {
		if (policy) break;
		if (AI_HEADING.test((await read(p)) ?? '')) policy = p;
	}

	// 2. Instruction files for AI agents.
	const agents = find(paths, AGENT_FILES);

	// 3. A test suite that CI runs on every pull request.
	const tests = find(
		paths.filter((p) => !/(^|\/)\./.test(p) && !/\.(md|mdx|txt|json|ya?ml)$/i.test(p)),
		TEST_FILES,
	);
	const onPr = workflows.filter(([, text]) => /pull_request/.test(text));
	const ci =
		onPr.find(([p]) => /test/i.test(p))?.[0] ??
		onPr.find(([, text]) => TEST_COMMAND.test(text))?.[0] ??
		find(paths, OTHER_CI);

	// 4. AI review: a reviewer's config file, a review action in CI, or a review bot on recent pull requests.
	let review = find(paths, REVIEW_FILES) ?? workflows.find(([, text]) => REVIEW_ACTIONS.test(text))?.[0];
	if (!review) {
		const recent = [
			...((await api(`repos/${slug}/pulls/comments?per_page=100&sort=created&direction=desc`)) ?? []),
			...((await api(`repos/${slug}/issues/comments?per_page=100&sort=created&direction=desc`)) ?? []),
		];
		const bot = recent.find((c) => REVIEW_BOTS.has(c.user?.login));
		if (bot) review = `${bot.user.login} on ${bot.html_url}`;
	}

	const checks = {
		policy: { pass: Boolean(policy), evidence: policy ?? null },
		agents: { pass: Boolean(agents), evidence: agents ?? null },
		tests: { pass: Boolean(tests && ci), evidence: tests && ci ? `${tests}; CI: ${ci}` : null },
		review: { pass: Boolean(review), evidence: review ?? null },
	};
	return {
		repo: slug,
		score: Object.values(checks).filter((c) => c.pass).length,
		checks,
		checkedAt: new Date().toISOString().slice(0, 10),
		truncated: Boolean(tree.truncated),
	};
}

async function main(args) {
	if (args[0] === '--awesome') {
		const entries = JSON.parse(readFileSync(AWESOME, 'utf8'));
		// A repository that fails to score keeps its previous result.
		const previous = (() => {
			try {
				return JSON.parse(readFileSync(RESULTS, 'utf8'));
			} catch {
				return {};
			}
		})();
		const results = {};
		for (const { repo } of entries) {
			try {
				results[repo] = await score(repo);
				console.error(`${repo}: ${results[repo].score}/4`);
			} catch (err) {
				console.error(`${repo}: ${err.message}`);
				if (previous[repo]) results[repo] = previous[repo];
			}
		}
		writeFileSync(RESULTS, JSON.stringify(results, null, '\t') + '\n');
		return;
	}
	if (!args.length) {
		console.error('usage: readiness.mjs owner/repo [...] | --awesome');
		process.exit(2);
	}
	for (const slug of args) {
		const r = await score(slug);
		console.log(`${r.repo}: ${r.score}/4`);
		for (const [name, c] of Object.entries(r.checks)) console.log(`  ${c.pass ? '✓' : '✗'} ${name}${c.evidence ? `  (${c.evidence})` : ''}`);
	}
}

main(process.argv.slice(2)).catch((err) => {
	console.error(err.message);
	process.exit(1);
});
