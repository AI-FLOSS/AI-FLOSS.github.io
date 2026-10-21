// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
	site: 'https://x-tech-laboratories.github.io',
	integrations: [
		starlight({
			title: 'X-Tech Laboratories',
			description:
				'An open source community for extensible, interoperable software, consolidated projects, automated development and AI used in the open.',
			logo: { src: './src/assets/logo.svg', alt: 'X-Tech Laboratories', replacesTitle: true },
			favicon: '/favicon.svg',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/x-tech-laboratories' },
				{ icon: 'matrix', label: 'Matrix', href: 'https://matrix.to/#/#x-tech-laboratories:matrix.org' },
			],
			editLink: { baseUrl: 'https://github.com/x-tech-laboratories/x-tech-laboratories.github.io/edit/main/' },
			customCss: [
				'@fontsource/noto-sans/400.css',
				'@fontsource/noto-sans/700.css',
				'@fontsource/rajdhani/700.css',
				'./src/styles/theme.css',
			],
			sidebar: [
				{ label: 'Guidelines', items: [{ autogenerate: { directory: 'guidelines' } }] },
				{ label: 'Projects', slug: 'projects' },
				{ label: 'Awesome AI-Assisted Open Source', slug: 'awesome' },
				{ label: 'Get involved', slug: 'join' },
			],
		}),
	],
});
