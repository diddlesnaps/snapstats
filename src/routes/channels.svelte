<script context="module">
    import SnapList from '../components/SnapList.svelte';
    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import client from '../apollo';
	import { gql } from 'apollo-boost';

	const q = gql`
		query {
			channelsByDate(query:{}){
				_id,
				channels{
					name,
					count
				}
			}
			channelTimeline{
				_id
				counts{
					date
					count
				}
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
	<title>Snap Store channels statistics | Snapstats.org</title>
	<meta name="description" content="Statistics about Snap Package channels within the Snap Store for Linux" />

	<meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:app_id" content="2603641926537298" />
	<meta property="og:type" content="website" />
    <meta property="og:url" content="https://snapstats.org/snaps" />
    <meta property="og:title" content="Snap Store channels statistics | Snapstats.org" />
    <meta property="og:description" content="Statistics about Snap Package channels within the Snap Store for Linux" />
    <meta property="og:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@diddledan" />
    <meta name="twitter:creator" content="@diddledan" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Channels</h1>
	<DonateBtn/>
	<Timeline title="Channels timeline" data={result.data.channelTimeline} />
	<a href="/">Go back to the homepage...</a>
{/await}
</div>
