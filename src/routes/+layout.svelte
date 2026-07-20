<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/svg+xml" href="/presence-logo-assets/favicon.svg" />
</svelte:head>
{@render children()}
