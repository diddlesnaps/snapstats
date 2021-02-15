<script>
	// @ts-check

	import { stores } from '@sapper/app';
	import { derived } from 'svelte/store';
	import '@beyonk/gdpr-cookie-consent-banner/dist/style.css'
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner/src/components/Banner.svelte'
	import Nav from '../components/Nav.svelte';
	import PacmanLoader from '../components/PacmanLoader.svelte';

	export let segment;

	const { preloading, page } = stores();
	/** @type require('svelte/store').Readable<boolean> */
	const delayedPreloading = derived(preloading,
		/**
		 * @param {boolean} currentPreloading
		 * @param {(preloading: boolean) => void} set
		 */
		(currentPreloading, set) => {
			setTimeout(() => set(!!currentPreloading), 250);
		}
	);

	function enableAnalytics() {
		if (process.env.NODE_ENV === 'production') {
			globalThis.firebase?.analytics();
			globalThis.firebase?.performance();
		}
	}
	let GDPRCategories = {
		analytics: () => true
	}
</script>

<style>
	main {
		position: relative;
		max-width: 56rem;
		background-color: white;
		padding: 2rem;
		margin: 0 auto;
		box-sizing: border-box;
	}
	footer {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}

	.loading {
		text-align: center;
		display: grid;
		place-content: center;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		z-index: 1;
		background: rgba(0,30,30,0.9);
		color: #ffffff;
	}
</style>

<svelte:head>
	{@html `${'<script'} type="application/ld+json">
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

	{@html `${'<script'} type="application/ld+json">
        ${JSON.stringify({
			"@context": "http://schema.org",
			"@id": "https://snapstats.org/#website",
			"@type": "WebPage",
			"name": "Snapstats.org",
			"url": `https://snapstats.org${$page.path}`
		})}
	</${'script'}>`}

	<meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:app_id" content="2603641926537298" />
	<meta name="twitter:site" content="@snapstats_org" />
</svelte:head>

<Nav {segment}/>


{#if $preloading && $delayedPreloading}
	<div class="loading">
		Loading...
		<PacmanLoader style='--pacman-color: #87bea1; --pacman-balls-color: #f25f48' />
	</div>
{/if}
<main>
	<slot></slot>
</main>

<footer>
	<a href='privacy'>Privacy policy</a>
</footer>
<GdprBanner cookieName="gdprOptIn" choices={{tracking: false, marketing: false}} on:analytics={enableAnalytics}
	description="We use cookies to analyze site traffic. Please review our <a href='/privacy'>privacy policy page</a>. By clicking accept, you consent to our privacy policy &amp; use of cookies" />
