// Publishes a shields.io endpoint badge for every scored repository, at /badges/<owner>/<repo>.json.
import type { APIRoute, GetStaticPaths } from 'astro';
import readiness from '../../../data/readiness.json';

const COLOURS = ['red', 'orange', 'yellow', 'green', 'brightgreen'];

export const getStaticPaths = (() =>
	Object.values(readiness as Record<string, { repo: string; score: number }>).map((r) => {
		const [owner, repo] = r.repo.split('/');
		return { params: { owner, repo }, props: { score: r.score } };
	})) satisfies GetStaticPaths;

export const GET: APIRoute = ({ props }) =>
	new Response(
		JSON.stringify({
			schemaVersion: 1,
			label: 'AI readiness',
			message: `${props.score}/4`,
			color: COLOURS[props.score],
		}),
		{ headers: { 'Content-Type': 'application/json' } },
	);
