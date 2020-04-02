<script>
	import { stores } from '@sapper/app';
	import Nav from '../components/Nav.svelte';

	export let segment;

	const { page } = stores();
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
	footer {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}
</style>

<svelte:head>
	{@html `<script type="application/ld+json">
        ${JSON.stringify({
			"@context": "http://schema.org/",
			"@id": "https://snapstats.org/#organization",
			"@type": "Organization",
			"name": "Snapstats.org",
			"logo": "https://snapstats.org/favicons/android-icon-512x512.png",
			"url": "https://snapstats.org/",
			"sameAs": [
				"https://github.com/diddlesnaps/snapstats",
				"https://twitter.com/snapstats_org",
				"https://www.facebook.com/SnapstatsOrg",
			]
		})}
	</${'script'}>`}

	{@html `<script type="application/ld+json">
        ${JSON.stringify({
			"@context": "http://schema.org",
			"@id": "https://snapstats.org/#website",
			"@type": "WebPage",
			"name": "Snapstats.org",
			"url": `https://snapstats.org${$page.path}`
		})}
	</${'script'}>`}
</svelte:head>

<Nav {segment}/>

<main>
	<slot></slot>
</main>

<footer>
	<a href='privacy'>Privacy policy</a>
</footer>