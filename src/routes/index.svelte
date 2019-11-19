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
			}
		}
	`;

	export async function preload(page, session) {
		return { cache: await client.query({ query: q }) };
    }
</script>

<script>
	import { setClient, restore, query } from 'svelte-apollo';

	export let cache;

	restore(client, q, cache.data);
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

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Snap store statistics</title>
	<meta name="description" content="Statistics about Snap Packages within the Snap Store for Linux" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Total snaps count</h1>
	<p>
		There are <strong>{result.data.snapCountsByDate[0].snapCounts[0].total || 0}</strong> snaps currently in the store, of which <strong>{(result.data.snapCountsByDate[0].snapCounts[0].total || 0) - (result.data.snapCountsByDate[0].snapCounts[0].filtered || 0)}</strong> appear to be test or hello-world snaps. Test and hello-world snaps are identified by a name that begins with <code>hello-</code> or <code>test-</code>, or a name that ends with <code>-test</code>. All other statistics on this site exclude those test or hello-world snaps.
	</p>

	<h2>The six most-recently added snaps</h2>
	<SnapList snaps={result.data.snapsByDate} />

	<h2>Developers</h2>
	<p>There are <strong>{result.data.developerCountsByDate[0].developerCounts[0].total || 0}</strong> developers who have published at least one snap.</p>
	<h3>Developer Averages</h3>
	<p>
		Developers with published snaps have each published an average (<a href="https://en.wikipedia.org/wiki/Arithmetic_mean">mean</a>) of <strong>{result.data.developerCountsByDate[0].developerCounts[0].mean || 0}</strong> snaps.
		The most common number of snaps published per developer (<a href="https://en.wikipedia.org/wiki/Mode_(statistics)">mode</a>) is <strong>{result.data.developerCountsByDate[0].developerCounts[0].mode || 0}</strong>.
	</p>
	<DonateBtn/>
	<Timeline title="Developer counts timeline" data={[
		{title: "Developer Count", items: result.data.developerCountTimeline},
		{title: "Snap Count", items: result.data.snapCountTimeline},
	]} />
{/await}
</div>
