<script lang="ts">
	import type { Locale } from '$lib/i18n/messages';
	import { Languages } from '@lucide/svelte';

	let {
		locale,
		ariaLabel,
		onLocaleChange
	}: {
		locale: Locale;
		ariaLabel: string;
		onLocaleChange: (locale: Locale) => void;
	} = $props();
</script>

<button
	type="button"
	class="language-button"
	aria-label={ariaLabel}
	onclick={() => onLocaleChange(locale === 'en' ? 'ko' : 'en')}
>
	<Languages size={16} aria-hidden="true" />
	<span>{locale === 'en' ? '한국어로 보기' : 'View in English'}</span>
</button>

<style>
	.language-button {
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 0 13px;
		border: 1px solid #cfd6dc;
		border-radius: 6px;
		background: #fff;
		color: #46525d;
		cursor: pointer;
		font: 700 12px/1 inherit;
		white-space: nowrap;
		touch-action: manipulation;
		transition:
			border-color 0.16s ease,
			background-color 0.16s ease,
			color 0.16s ease;
	}
	.language-button:hover {
		border-color: #9eabb5;
		background: #f2f5f7;
		color: #1f2933;
	}
	.language-button:focus-visible {
		outline: 3px solid rgba(68, 110, 131, 0.24);
		outline-offset: 2px;
	}
	.language-button :global(svg) {
		flex: none;
		color: #617788;
	}
	@media (max-width: 620px) {
		.language-button {
			min-height: 44px;
			padding: 0 10px;
			font-size: 11px;
		}
	}
</style>
