<script context="module">
    import SnapList from '../components/SnapList.svelte';
    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import client from '../apollo';
	import { gql } from 'apollo-boost';

	const q = gql`
		query {
			snapCountsByDate(query:{}){
				_id
				snapCounts{
					total
					filtered
				}
			}
			developerCountsByDate(query:{}){
				_id
				developerCounts{
					total
					mean
					mode
					median
				}
			}
			developerCountTimeline{
				_id
				total
				mean
			}
			snapCountTimeline{
				_id
				total
				filtered
			}
			snapsByDate(query:{limit:6}){
				snap_id
				package_name
				title
				summary
				icon_url
				ratings_average
			}
			findSnapsCount(developerValidated:true){
				count
			}
			verifiedDeveloperCount{
				count
			}
		}
	`;

	export async function preload(page, session) {
		return { cache: await (await client.query({ query: q })).data };
    }
</script>

<script>
	import { setClient, restore, query } from 'svelte-apollo';

	export let cache;

	restore(client, q, cache);
	setClient(client);
	let data = query(client, { query: q });
</script>

<style>
	h1, p {
		text-align: center;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.8em;
		text-transform: uppercase;
		font-weight: 700;
		margin: 0 0 0.5em 0;
	}

	p {
		margin: 1em auto;
	}

	.verified:after {
		content: '✓';
		color: #0a0;
	}

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Snapstats.org Snap Store statistics</title>
	<meta name="description" content="Statistics about Snap Packages within the Snap Store for Linux" />

	<!-- Facebook -->
	<meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:app_id" content="2603641926537298" />
	<meta property="og:type" content="website" />
    <meta property="og:url" content="https://snapstats.org/snaps" />
    <meta property="og:title" content="Snapstats.org Snap Store statistics" />
    <meta property="og:description" content="Statistics about Snap Packages within the Snap Store for Linux" />
    <meta property="og:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

	<!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@snapstats_org" />
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="Snapstats.org Snap Store statistics" />
    <meta name="twitter:description" content="Statistics about Snap Packages within the Snap Store for Linux" />
    <meta name="twitter:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Total Snaps count</h1>
	{#if (result.data.snapCountsByDate.length > 0 && result.data.snapCountsByDate[0].snapCounts.length > 0)}
		<p>There are <strong>{result.data.snapCountsByDate[0].snapCounts[0].total || 0}</strong> Snaps currently in the Store, of which <strong>{(result.data.snapCountsByDate[0].snapCounts[0].total || 0) - (result.data.snapCountsByDate[0].snapCounts[0].filtered || 0)}</strong> appear to be test or hello-world Snaps. Test and hello-world Snaps are identified by a name that begins with <code>hello-</code> or <code>test-</code>, or a name that ends with <code>-test</code>. All other statistics on this site exclude those test or hello-world Snaps.</p>
		<p><span class="verified">Verified</span> developers, a total of <strong>{result.data.verifiedDeveloperCount.count}</strong> developers, have published <strong>{result.data.findSnapsCount.count}</strong> Snaps.</p>
	{:else}
		<p>There are an unknown number of Snaps currently in the Store.</p>
	{/if}

	<h2>The six most-recently added Snaps</h2>
	<SnapList snaps={result.data.snapsByDate} />

	<h2>Developers</h2>
	{#if (result.data.developerCountsByDate.length > 0 && result.data.developerCountsByDate[0].developerCounts.length > 0)}
		<p>There are <strong>{result.data.developerCountsByDate[0].developerCounts[0].total || 0}</strong> developers who have published at least one snap.</p>
	{:else}
		<p>There are an unknown number of developers who have published at least one snap.</p>
	{/if}	
	
	<h3>Developer Averages</h3>
	<p>
		Developers with published Snaps have each published an average (<a href="https://en.wikipedia.org/wiki/Arithmetic_mean">mean</a>) of <strong>{result.data.developerCountsByDate[0].developerCounts[0].mean || 0}</strong> Snaps.
		The most common number of Snaps published per developer (<a href="https://en.wikipedia.org/wiki/Mode_(statistics)">mode</a>) is <strong>{result.data.developerCountsByDate[0].developerCounts[0].mode || 0}</strong>.
	</p>
	<DonateBtn/>
	<Timeline title="Developer counts timeline" data={[
		{title: "Developer Count", items: result.data.developerCountTimeline},
		{title: "Snap Count", items: result.data.snapCountTimeline},
	]} />
{/await}
</div>
