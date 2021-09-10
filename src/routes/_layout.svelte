<script>
	// @ts-check

	import { stores } from '@sapper/app';
	import { derived } from 'svelte/store';
	import '@beyonk/gdpr-cookie-consent-banner/dist/style.css'
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner/src/components/Banner.svelte'
	import Nav from '../components/Nav.svelte';
	import PacmanLoader from '../components/PacmanLoader.svelte';

	import { initializeApp } from 'firebase/app';
	import { getAnalytics } from "firebase/analytics";
	import { getPerformance } from "firebase/performance";

	const firebaseConfig = {
		"apiKey": "AIzaSyDw0caGVGccf5pv5FC-0kXFpR6eFxfiVq8",
		"appId": "1:765277289423:web:1d8708e7c9a9590abb30ba",
		"authDomain": "snapstatsorg.firebaseapp.com",
		"databaseURL": "https://snapstatsorg.firebaseio.com",
		"measurementId": "G-47YKSBS1V0",
		"messagingSenderId": "765277289423",
		"projectId": "snapstatsorg",
		"storageBucket": "snapstatsorg.appspot.com"
	}

	const app = initializeApp(firebaseConfig);
	const analytics = getAnalytics();
	analytics.app.automaticDataCollectionEnabled = false;
	const performance = getPerformance();
	performance.dataCollectionEnabled = false;
	performance.instrumentationEnabled = false;

	export let segment;

	const { preloading, page } = stores();
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
			analytics.app.automaticDataCollectionEnabled = true;
			performance.dataCollectionEnabled = true;
			performance.instrumentationEnabled = true;
		}
	}

	function enableAdvertising() {
		if (process.env.NODE_ENV === 'production') {
			
		}
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
		flex-direction: column;
		align-items: center;
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
	<p>Cloud Hosting by <a href="https://gcpsignup.page.link/Y1i1">Google Cloud - sign up with this link to get $350 credit</a></p>
	<p><a href='privacy'>Privacy policy</a></p>
</footer>
<GdprBanner cookieName="gdprOptIn" cookieConfig={{sameSite: 'strict'}} choices={{analytics: false, tracking: false}} on:analytics={enableAnalytics} on:tracking={enableAdvertising}
	description="We use cookies to analyze site traffic. Please review our <a href='/privacy'>privacy policy page</a>. By clicking accept, you consent to our privacy policy &amp; use of cookies" />
