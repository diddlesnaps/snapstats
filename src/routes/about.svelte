<script>
	// @ts-check

	import DonateBtn from '../components/DonateBtn.svelte';
</script>

<svelte:head>
	<title>About Snapstats.org</title>
	<meta name="description" content="Find out about the Snapstats.org website" />

	<!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="About Snapstats.org" />
    <meta property="og:description" content="Find out about the Snapstats.org website" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

	<!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="About Snapstats.org" />
    <meta name="twitter:description" content="Find out about the Snapstats.org website" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

<h1>About Snapstats.org</h1>

<p>
	Snapstats.org is a project by Daniel Llewellyn, aka diddledan, a prolific
	Snapcrafter (creator of snap packages). The site catalogues all the
	publicly visible Snap package information and aggregates some
	statistics about the available packages. The statistics and latest
	Snaps are synchronised from the public Snap Store every 4 hours.
</p>
<p>
	You can find out more about the Snap Store at <a href="https://snapcraft.io/">Snapcraft.io</a>.
	For information on publishing your own Snap package, browse <a href="https://snapcraft.io/docs/creating-a-snap">the Snapcraft.io documentation</a>.
</p>
<DonateBtn/>
<p>
	While the service is free to use, it is not free for me to run. If you
	have the means, a donation to help cover the costs of running the site
	would be appreciated. By donating you are helping to ensure the
	community can continue to benefit from the insights it provides.
</p>
