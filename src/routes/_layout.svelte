<script>
	import { stores } from '@sapper/app';
	import '@beyonk/gdpr-cookie-consent-banner/dist/style.css'
	import GdprBanner from '@beyonk/gdpr-cookie-consent-banner/src/components/Banner.svelte'
	import Nav from '../components/Nav.svelte';

	export let segment;

	const { page } = stores();
	
	function enableAnalytics() {
		if (process.env.NODE_ENV === 'production') {
			firebase.analytics();
			firebase.performance();
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
<GdprBanner cookieName="gdprOptIn" choices={{tracking: false, marketing: false}} on:analytics={enableAnalytics}
	description="We use cookies to analyze site traffic. Please review our <a href='/privacy'>privacy policy page</a>. By clicking accept, you consent to our privacy policy &amp; use of cookies" />
