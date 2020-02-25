<script>
	import DonateBtn from '../components/DonateBtn.svelte';
</script>

<svelte:head>
	<title>About Snapstats.org</title>
	<meta name="description" content="Find out about the Snapstats.org website" />

	<meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:appid" content="2603641926537298" />
	<meta property="og:type" content="website" />
    <meta property="og:url" content="https://snapstats.org/snaps" />
    <meta property="og:title" content="About Snapstats.org" />
    <meta property="og:description" content="Find out about the Snapstats.org website" />
    <meta property="og:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@diddledan" />
    <meta name="twitter:creator" content="@diddledan" />
</svelte:head>

<h1>About Snapstats.org</h1>

<p>
	Snapstats.org is a project by Daniel Llewellyn, aka diddledan, a prolific
	snapcrafter	(creator of snap packages). The site catalogues all the
	publically visible Snap package information and aggregates some
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
