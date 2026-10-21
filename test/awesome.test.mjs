// Checks that every Awesome AI-Assisted Open Source entry is complete and that the readiness data matches the list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const entries = load('../src/data/awesome.json');
const readiness = load('../src/data/readiness.json');

const CATEGORIES = ['Applications', 'Developer tools', 'Libraries', 'Infrastructure', 'AI agents'];
// OSI- or FSF-approved licences seen so far; extend this list when a new one is added.
const FREE_LICENCES = new Set([
	'MIT',
	'Apache-2.0',
	'BSD-2-Clause',
	'BSD-3-Clause',
	'ISC',
	'MPL-2.0',
	'GPL-2.0-only',
	'GPL-2.0-or-later',
	'GPL-3.0-only',
	'GPL-3.0-or-later',
	'LGPL-2.1-or-later',
	'LGPL-3.0-or-later',
	'AGPL-3.0-only',
	'AGPL-3.0-or-later',
	'Zlib',
	'Unlicense',
	'0BSD',
]);

test('the list is not empty', () => {
	assert.ok(entries.length > 0);
});

for (const e of entries) {
	test(`${e.name}: entry is complete and valid`, () => {
		for (const field of ['name', 'repo', 'licence', 'category', 'description']) {
			assert.equal(typeof e[field], 'string', `${field} is missing`);
			assert.ok(e[field].trim(), `${field} is empty`);
		}
		assert.match(e.repo, /^[\w.-]+\/[\w.-]+$/, 'repo must be owner/name');
		assert.ok(FREE_LICENCES.has(e.licence), `${e.licence} is not a known free licence`);
		assert.ok(CATEGORIES.includes(e.category), `unknown category ${e.category}`);
		assert.match(e.description, /\.$/, 'description should end with a full stop');
		assert.ok(e.evidence?.label && e.evidence?.text, 'evidence needs a label and text');
		assert.match(e.evidence.url, /^https:\/\//, 'evidence must link to an https URL');
	});
}

test('no project is listed twice', () => {
	const repos = entries.map((e) => e.repo.toLowerCase());
	assert.equal(new Set(repos).size, repos.length);
});

test('every listed project has a readiness score', () => {
	const missing = entries.filter((e) => !readiness[e.repo]).map((e) => e.repo);
	assert.deepEqual(missing, [], 'run node scripts/readiness.mjs --awesome');
});

test('readiness scores are consistent with their checks', () => {
	for (const [repo, r] of Object.entries(readiness)) {
		const passed = Object.values(r.checks).filter((c) => c.pass).length;
		assert.equal(r.score, passed, `${repo} score does not match its checks`);
		assert.equal(r.total, Object.keys(r.checks).length, `${repo} total does not match its checks`);
	}
});
