<script context="module">
    import SnapList from '../components/SnapList.svelte';
    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import client from '../apollo';
	import { gql } from 'apollo-boost';

	const q = gql`
		query {
			basesByDate(query:{}){
				_id,
				bases{
					name,
					count
				}
			}
			baseTimeline{
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
	<title>Snap store bases statistics</title>
	<meta name="description" content="Statistics about Snap Package Base Snap usage distribution within the Snap Store for Linux" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Bases</h1>
	<DonateBtn/>
	<Timeline title="Bases timeline" data={result.data.baseTimeline} />
	<a href="/">Go back to the homepage...</a>
{/await}
</div>
