// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://ai-floss.github.io',
	integrations: [
		starlight({
			title: 'AI-FLOSS',
			description:
				'A community for AI-friendly free and open source development: prompting guidelines, disclosure, AI-assisted review and test-driven development.',
			logo: { src: './public/favicon.svg', alt: '' },
			favicon: '/favicon.svg',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/AI-FLOSS' },
				{ icon: 'matrix', label: 'Matrix', href: 'https://matrix.to/#/#ai-floss:matrix.org' },
			],
			editLink: { baseUrl: 'https://github.com/AI-FLOSS/AI-FLOSS.github.io/edit/main/' },
			customCss: ['./src/styles/theme.css'],
			sidebar: [
				{ label: 'Guidelines', items: [{ autogenerate: { directory: 'guidelines' } }] },
				{ label: 'Projects', slug: 'projects' },
				{ label: 'Awesome AI-FLOSS', slug: 'awesome' },
				{ label: 'Get involved', slug: 'join' },
			],
		}),
	],
});
