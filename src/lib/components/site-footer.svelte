<script lang="ts">
	import { resolve } from '$app/paths';
	import { ExternalLink } from '@lucide/svelte';

	let {
		tagline,
		disclaimer,
		source,
		status,
		navigationLabel,
		primaryHref,
		primaryLabel,
		externalLabel,
		externalAriaLabel,
		externalDestination
	}: {
		tagline: string;
		disclaimer: string;
		source: string;
		status: string;
		navigationLabel: string;
		primaryHref: '/' | '/privacy';
		primaryLabel: string;
		externalLabel: string;
		externalAriaLabel: string;
		externalDestination: 'repository' | 'issues';
	} = $props();
</script>

<footer class="site-footer">
	<div class="footer-shell">
		<div class="footer-main">
			<div class="footer-identity">
				<img
					class="footer-lockup"
					src="/presence-logo-assets/presence-lockup.svg"
					alt="Presence"
					width="191"
					height="40"
					loading="lazy"
				/>
				<p class="footer-tagline">{tagline}</p>
			</div>

			<nav class="footer-nav" aria-label={navigationLabel}>
				<a href={resolve(primaryHref)}>{primaryLabel}</a>
				{#if externalDestination === 'issues'}
					<a
						href="https://github.com/qtaghdi/youcam-api-hackathon/issues"
						aria-label={externalAriaLabel}
						target="_blank"
						rel="noreferrer"
					>
						{externalLabel}
						<ExternalLink size={14} aria-hidden="true" />
					</a>
				{:else}
					<a
						href="https://github.com/qtaghdi/youcam-api-hackathon"
						aria-label={externalAriaLabel}
						target="_blank"
						rel="noreferrer"
					>
						{externalLabel}
						<ExternalLink size={14} aria-hidden="true" />
					</a>
				{/if}
			</nav>
		</div>

		<div class="footer-meta">
			<p>{disclaimer}</p>
			<div>
				<span>{source}</span>
				<small>{status}</small>
			</div>
		</div>
	</div>
</footer>

<style>
	.site-footer {
		border-top: 1px solid #d9dee3;
		background: #f0f3f5;
		color: #53616c;
	}
	.footer-shell {
		max-width: 1240px;
		margin: auto;
		padding: 36px 32px 28px;
	}
	.footer-main,
	.footer-meta,
	.footer-identity,
	.footer-nav,
	.footer-meta > div {
		display: flex;
		align-items: center;
	}
	.footer-main,
	.footer-meta {
		justify-content: space-between;
		gap: 32px;
	}
	.footer-identity {
		min-width: 0;
		display: block;
	}
	.footer-lockup {
		display: block;
		width: auto;
		height: 32px;
	}
	.footer-tagline {
		margin: 8px 0 0;
		color: #687680;
		font-size: 13px;
		line-height: 1.5;
		text-wrap: pretty;
	}
	.footer-nav {
		flex: none;
		gap: 8px;
	}
	.footer-nav a {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		padding: 0 14px;
		border: 1px solid #c8d0d6;
		border-radius: 6px;
		background: #fff;
		color: #3d5e75;
		font-size: 12px;
		font-weight: 750;
		text-decoration: none;
		touch-action: manipulation;
		transition:
			border-color 0.16s ease,
			background-color 0.16s ease,
			color 0.16s ease;
	}
	.footer-nav a:hover {
		border-color: #97a6b1;
		background: #f8fafb;
		color: #1f4058;
	}
	.footer-nav a:focus-visible {
		outline: 3px solid rgba(68, 110, 131, 0.24);
		outline-offset: 2px;
	}
	.footer-meta {
		margin-top: 27px;
		padding-top: 20px;
		border-top: 1px solid #d2d9de;
		align-items: flex-start;
	}
	.footer-meta > p {
		max-width: 760px;
		margin: 0;
		color: #66737d;
		font-size: 12px;
		line-height: 1.65;
		text-wrap: pretty;
	}
	.footer-meta > div {
		flex: none;
		gap: 14px;
		color: #71808a;
		font-size: 12px;
		line-height: 1.5;
		white-space: nowrap;
	}
	.footer-meta small {
		padding-left: 14px;
		border-left: 1px solid #c9d1d7;
		font-size: inherit;
	}
	@media (max-width: 760px) {
		.footer-shell {
			padding: 30px 20px 24px;
		}
		.footer-main,
		.footer-meta {
			align-items: stretch;
			flex-direction: column;
			gap: 20px;
		}
		.footer-nav {
			width: 100%;
		}
		.footer-nav a {
			flex: 1;
		}
		.footer-meta {
			gap: 12px;
		}
		.footer-meta > div {
			flex-wrap: wrap;
			white-space: normal;
		}
	}
	@media (max-width: 420px) {
		.footer-nav {
			align-items: stretch;
			flex-direction: column;
		}
		.footer-meta > div {
			align-items: flex-start;
			flex-direction: column;
			gap: 4px;
		}
		.footer-meta small {
			padding-left: 0;
			border-left: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.footer-nav a {
			transition: none;
		}
	}
</style>
