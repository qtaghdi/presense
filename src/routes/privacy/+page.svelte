<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import {
		ArrowLeft,
		ExternalLink,
		Laptop,
		MessageSquare,
		Send,
		ShieldCheck
	} from '@lucide/svelte';
	import LanguageButton from '$lib/components/LanguageButton.svelte';
	import SiteFooter from '$lib/components/SiteFooter.svelte';
	import { isLocale, type Locale } from '$lib/i18n/messages';
	import { privacyMessages } from '$lib/i18n/privacy';

	let locale = $state<Locale>('en');
	const copy = $derived(privacyMessages[locale]);

	onMount(() => {
		const savedLocale = localStorage.getItem('presence-locale');
		if (isLocale(savedLocale)) locale = savedLocale;
		document.documentElement.lang = locale;
	});

	function setLocale(nextLocale: Locale) {
		locale = nextLocale;
		localStorage.setItem('presence-locale', nextLocale);
		document.documentElement.lang = nextLocale;
	}
</script>

<svelte:head>
	<title>{copy.meta.title}</title>
	<meta name="description" content={copy.meta.description} />
</svelte:head>

<a class="skip-link" href="#privacy-content">{copy.navigation.skip}</a>

<header class="privacy-header">
	<a class="brand" href={resolve('/')} aria-label={copy.navigation.home}>
		<img
			class="brand-lockup"
			src="/presence-logo-assets/presence-lockup.svg"
			alt=""
			width="191"
			height="40"
		/>
	</a>
	<div class="header-actions">
		<a class="back-link" href={resolve('/')}>
			<ArrowLeft size={16} aria-hidden="true" />
			<span>{copy.navigation.back}</span>
		</a>
		<LanguageButton {locale} ariaLabel={copy.navigation.language} onLocaleChange={setLocale} />
	</div>
</header>

<main id="privacy-content">
	<section class="privacy-hero" aria-labelledby="privacy-title">
		<p class="eyebrow">{copy.hero.eyebrow}</p>
		<h1 id="privacy-title">{copy.hero.title}</h1>
		<p class="hero-description">{copy.hero.description}</p>
		<div class="dates">
			<span>{copy.hero.effective}</span>
			<span>{copy.hero.updated}</span>
		</div>
	</section>

	<aside class="prototype-notice" aria-labelledby="prototype-title">
		<ShieldCheck size={21} aria-hidden="true" />
		<div>
			<h2 id="prototype-title">{copy.prototype.title}</h2>
			<p>{copy.prototype.body}</p>
		</div>
	</aside>

	<section class="privacy-highlights" aria-label={copy.hero.title}>
		{#each copy.highlights as highlight, index (highlight.title)}
			<article>
				<div class="highlight-icon" aria-hidden="true">
					{#if index === 0}
						<ShieldCheck size={19} />
					{:else if index === 1}
						<Laptop size={19} />
					{:else}
						<Send size={19} />
					{/if}
				</div>
				<p>{highlight.label}</p>
				<h2>{highlight.title}</h2>
				<span>{highlight.body}</span>
			</article>
		{/each}
	</section>

	<div class="policy-layout">
		<nav class="policy-toc" aria-label={copy.contentsLabel}>
			<p>{copy.contentsLabel}</p>
			<ol>
				{#each copy.sections as section (section.id)}
					<li><a href={`#${section.id}`}>{section.number} {section.title}</a></li>
				{/each}
			</ol>
		</nav>

		<article class="policy">
			{#each copy.sections as section (section.id)}
				<section id={section.id} aria-labelledby={`${section.id}-title`}>
					<div class="section-heading">
						<span>{section.number}</span>
						<h2 id={`${section.id}-title`}>{section.title}</h2>
					</div>

					{#each section.paragraphs as paragraph (paragraph)}
						<p>{paragraph}</p>
					{/each}

					{#if section.items.length}
						<div class="data-list">
							{#each section.items as item (item.title)}
								<div>
									<h3>{item.title}</h3>
									<p>{item.body}</p>
								</div>
							{/each}
						</div>
					{/if}

					{#if section.id === 'providers'}
						<div class="provider-links">
							<p>{copy.providerLinks.label}</p>
							<a
								href="https://www.perfectcorp.com/perfectbeauty/youcam/terms-of-service-api"
								target="_blank"
								rel="noreferrer"
								>{copy.providerLinks.perfectTerms}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a
								href="https://www.perfectcorp.com/youcamapps/youcam/privacy-policy.html"
								target="_blank"
								rel="noreferrer"
								>{copy.providerLinks.perfectPrivacy}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a href="https://vercel.com/legal/privacy-notice" target="_blank" rel="noreferrer"
								>{copy.providerLinks.vercel}<ExternalLink size={14} aria-hidden="true" /></a
							>
							<a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer"
								>{copy.providerLinks.google}<ExternalLink size={14} aria-hidden="true" /></a
							>
						</div>
					{/if}
				</section>
			{/each}

			<aside class="contact-card" aria-labelledby="contact-card-title">
				<MessageSquare size={22} aria-hidden="true" />
				<div>
					<p>{copy.contact.label}</p>
					<h2 id="contact-card-title">{copy.contact.title}</h2>
					<span>{copy.contact.body}</span>
				</div>
				<a
					href="https://github.com/qtaghdi/youcam-api-hackathon/issues"
					target="_blank"
					rel="noreferrer">{copy.contact.action}<ExternalLink size={15} aria-hidden="true" /></a
				>
			</aside>
		</article>
	</div>
</main>

<SiteFooter
	tagline={copy.footer.tagline}
	disclaimer={copy.prototype.body}
	source={copy.footer.source}
	status={copy.footer.status}
	navigationLabel={copy.footer.navigation}
	primaryHref="/"
	primaryLabel={copy.footer.home}
	externalLabel={copy.footer.issues}
	externalAriaLabel={copy.footer.issuesExternal}
	externalDestination="issues"
/>

<style>
	:global(:root) {
		--privacy-ink: #1f2933;
		--privacy-muted: #66727d;
		--privacy-cream: #f6f7f8;
		--privacy-line: #d9dee3;
		--privacy-blue: #2f628f;
		--privacy-paper: #fff;
	}
	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		color: var(--privacy-ink);
		background: var(--privacy-cream);
		overflow-x: hidden;
	}
	.skip-link {
		position: fixed;
		top: 10px;
		left: 10px;
		z-index: 20;
		padding: 10px 14px;
		border-radius: 4px;
		background: var(--privacy-ink);
		color: white;
		font-size: 13px;
		font-weight: 700;
		text-decoration: none;
		transform: translateY(-160%);
		transition: transform 0.16s ease;
	}
	.skip-link:focus-visible {
		transform: translateY(0);
	}
	.privacy-header {
		height: 80px;
		max-width: 1180px;
		margin: auto;
		padding: 0 30px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-bottom: 1px solid var(--privacy-line);
	}
	.brand {
		min-height: 44px;
		display: flex;
		align-items: center;
		color: var(--privacy-ink);
		font-size: 16px;
		font-weight: 700;
		text-decoration: none;
	}
	.brand-lockup {
		display: block;
		width: auto;
		height: 32px;
	}
	.header-actions,
	.back-link {
		display: flex;
		align-items: center;
	}
	.header-actions {
		gap: 18px;
	}
	.back-link {
		min-height: 44px;
		gap: 7px;
		color: var(--privacy-muted);
		font-size: 12px;
		font-weight: 700;
		text-decoration: none;
	}
	.back-link:hover {
		color: var(--privacy-ink);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
	main {
		max-width: 1180px;
		margin: auto;
		padding: 0 30px 100px;
	}
	.privacy-hero {
		max-width: 880px;
		padding: 92px 0 48px;
	}
	.eyebrow {
		margin: 0 0 18px;
		color: var(--privacy-blue);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.15em;
		text-transform: uppercase;
	}
	.privacy-hero h1 {
		max-width: 820px;
		margin: 0;
		font:
			500 clamp(42px, 5.4vw, 66px) / 1.08 Georgia,
			'Times New Roman',
			serif;
		letter-spacing: -0.045em;
		text-wrap: balance;
	}
	.hero-description {
		max-width: 760px;
		margin: 28px 0 0;
		color: var(--privacy-muted);
		font-size: 17px;
		line-height: 1.75;
		text-wrap: pretty;
	}
	.dates {
		display: flex;
		gap: 16px;
		margin-top: 26px;
		color: #7c8790;
		font-size: 11px;
		font-weight: 700;
	}
	.dates span + span {
		padding-left: 16px;
		border-left: 1px solid var(--privacy-line);
	}
	.prototype-notice {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 14px;
		padding: 20px 22px;
		border: 1px solid #cbd7df;
		border-left: 3px solid var(--privacy-blue);
		border-radius: 7px;
		background: #f0f4f7;
	}
	.prototype-notice > :global(svg) {
		margin-top: 2px;
		color: var(--privacy-blue);
	}
	.prototype-notice h2 {
		margin: 0;
		font-size: 14px;
	}
	.prototype-notice p {
		margin: 6px 0 0;
		color: #5f6d78;
		font-size: 12px;
		line-height: 1.65;
	}
	.privacy-highlights {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		margin: 34px 0 88px;
		border: 1px solid var(--privacy-line);
		border-radius: 8px;
		background: var(--privacy-paper);
	}
	.privacy-highlights article {
		min-height: 208px;
		padding: 27px;
	}
	.privacy-highlights article + article {
		border-left: 1px solid var(--privacy-line);
	}
	.highlight-icon {
		width: 38px;
		height: 38px;
		display: grid;
		place-items: center;
		margin-bottom: 23px;
		border-radius: 6px;
		background: #edf2f5;
		color: #3e647e;
	}
	.privacy-highlights p {
		margin: 0 0 8px;
		color: #81909b;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.privacy-highlights h2 {
		margin: 0;
		font-size: 16px;
		line-height: 1.35;
	}
	.privacy-highlights article > span {
		display: block;
		margin-top: 10px;
		color: var(--privacy-muted);
		font-size: 12px;
		line-height: 1.6;
	}
	.policy-layout {
		display: grid;
		grid-template-columns: 225px minmax(0, 1fr);
		grid-template-areas: 'toc policy';
		gap: 75px;
		align-items: start;
	}
	.policy-toc {
		grid-area: toc;
		display: block;
		min-width: 0;
		position: sticky;
		top: 28px;
		padding-top: 6px;
	}
	.policy-toc > p {
		margin: 0 0 14px;
		color: #85919a;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.policy-toc ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.policy-toc li {
		border-top: 1px solid var(--privacy-line);
	}
	.policy-toc li:last-child {
		border-bottom: 1px solid var(--privacy-line);
	}
	.policy-toc a {
		display: block;
		padding: 11px 2px;
		color: #697680;
		font-size: 11px;
		line-height: 1.45;
		text-decoration: none;
	}
	.policy-toc a:hover {
		color: var(--privacy-blue);
	}
	.policy {
		grid-area: policy;
		width: 100%;
		min-width: 0;
	}
	.policy > section {
		scroll-margin-top: 28px;
		padding: 0 0 58px;
	}
	.policy > section + section {
		padding-top: 58px;
		border-top: 1px solid var(--privacy-line);
	}
	.section-heading {
		display: grid;
		grid-template-columns: 34px 1fr;
		gap: 13px;
		align-items: baseline;
		margin-bottom: 23px;
	}
	.section-heading span {
		color: var(--privacy-blue);
		font-size: 11px;
		font-weight: 800;
	}
	.section-heading h2 {
		margin: 0;
		font-size: 26px;
		line-height: 1.25;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}
	.policy section > p {
		margin: 0 0 16px;
		color: #53616c;
		font-size: 14px;
		line-height: 1.85;
		text-wrap: pretty;
	}
	.data-list {
		margin-top: 25px;
		border: 1px solid var(--privacy-line);
		border-radius: 7px;
		background: var(--privacy-paper);
	}
	.data-list > div {
		display: grid;
		grid-template-columns: minmax(150px, 0.36fr) 1fr;
		gap: 28px;
		padding: 20px 22px;
	}
	.data-list > div + div {
		border-top: 1px solid var(--privacy-line);
	}
	.data-list h3 {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
	}
	.data-list p {
		margin: 0;
		color: #65727c;
		font-size: 12px;
		line-height: 1.7;
	}
	.provider-links {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 9px 16px;
		margin-top: 22px;
		padding: 16px 18px;
		border-radius: 6px;
		background: #edf1f3;
	}
	.provider-links p {
		width: 100%;
		margin: 0 0 2px;
		color: #77858e;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.11em;
		text-transform: uppercase;
	}
	.provider-links a,
	.contact-card a {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		color: #365f7b;
		font-size: 11px;
		font-weight: 700;
		text-underline-offset: 3px;
	}
	.contact-card {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: 16px;
		align-items: center;
		padding: 24px;
		border: 1px solid #cbd7df;
		border-radius: 8px;
		background: #f0f4f7;
	}
	.contact-card > :global(svg) {
		color: var(--privacy-blue);
	}
	.contact-card p {
		margin: 0 0 5px;
		color: #7a8892;
		font-size: 9px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}
	.contact-card h2 {
		margin: 0;
		font-size: 16px;
	}
	.contact-card span {
		display: block;
		margin-top: 7px;
		color: #65727c;
		font-size: 11px;
		line-height: 1.55;
	}
	.contact-card a {
		min-height: 44px;
		padding: 0 14px;
		border: 1px solid #b7c5ce;
		border-radius: 6px;
		background: #fff;
		white-space: nowrap;
		text-decoration: none;
	}
	.contact-card a:hover {
		border-color: #8499a8;
		background: #f8fafb;
	}
	@media (max-width: 820px) {
		.privacy-highlights {
			grid-template-columns: 1fr;
		}
		.privacy-highlights article {
			min-height: 0;
		}
		.privacy-highlights article + article {
			border-top: 1px solid var(--privacy-line);
			border-left: 0;
		}
		.policy-layout {
			grid-template-columns: 1fr;
			grid-template-areas:
				'toc'
				'policy';
			gap: 48px;
		}
		.policy-toc {
			position: static;
		}
		.policy-toc ol {
			display: grid;
			grid-template-columns: 1fr 1fr;
		}
		.policy-toc li:nth-child(2) {
			border-top: 1px solid var(--privacy-line);
		}
		.policy-toc li:nth-child(odd) {
			padding-right: 14px;
		}
		.policy-toc li:nth-child(even) {
			padding-left: 14px;
			border-left: 1px solid var(--privacy-line);
		}
		.contact-card {
			grid-template-columns: auto 1fr;
		}
		.contact-card a {
			grid-column: 1 / 3;
			justify-content: center;
		}
	}
	@media (max-width: 620px) {
		.privacy-header {
			height: 68px;
			padding: 0 18px;
		}
		.brand-lockup {
			height: 29px;
		}
		.back-link {
			display: none;
		}
		main {
			padding: 0 18px 72px;
		}
		.privacy-hero {
			padding: 62px 0 38px;
		}
		.privacy-hero h1 {
			font-size: clamp(38px, 11vw, 48px);
		}
		.hero-description {
			font-size: 15px;
		}
		.dates {
			flex-direction: column;
			gap: 5px;
		}
		.dates span + span {
			padding-left: 0;
			border-left: 0;
		}
		.prototype-notice {
			padding: 18px;
		}
		.privacy-highlights {
			margin: 25px 0 60px;
		}
		.privacy-highlights article {
			padding: 23px;
		}
		.policy-toc ol {
			display: block;
		}
		.policy-toc li,
		.policy-toc li:nth-child(odd),
		.policy-toc li:nth-child(even) {
			padding-right: 0;
			padding-left: 0;
			border-left: 0;
		}
		.policy-toc li:nth-child(2) {
			border-top: 1px solid var(--privacy-line);
		}
		.section-heading {
			grid-template-columns: 27px 1fr;
		}
		.section-heading h2 {
			font-size: 22px;
		}
		.data-list > div {
			grid-template-columns: 1fr;
			gap: 7px;
			padding: 18px;
		}
		.provider-links {
			align-items: flex-start;
			flex-direction: column;
		}
		.provider-links p {
			width: auto;
		}
		.contact-card {
			padding: 20px;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.skip-link {
			transition: none;
		}
	}
</style>
