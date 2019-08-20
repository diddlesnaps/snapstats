<script context="module">
    import SnapList from '../components/SnapList.svelte';
    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import client from '../apollo';

	import { gql } from 'apollo-boost'; 
	const q = gql`
		query {
			licensesByDate(query:{}){
				_id,
				licenses{
					name,
					count
				}
			}
			licenseTimeline{
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
	import { restore, query } from 'svelte-apollo';

	export let cache;

	restore(client, q, cache.data);
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
	<title>Snap store licenses statistics</title>
	<meta name="description" content="Statistics about Snap Package license distribution within the Snap Store for Linux" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Licenses</h1>
	<DonateBtn/>
	<Timeline title="Licenses timeline" data={result.data.licenseTimeline} />
	<a href="/">Go back to the homepage...</a>
{/await}
</div>
