<script context="module">
	// @ts-check

    import SnapList from '../components/SnapList.svelte';
    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import client from '../apollo';
	import { gql } from 'apollo-boost';

	const q = gql`
		query {
			architecturesByDate(query:{}){
				_id,
				architectures{
					name,
					count
				}
			}
			architectureTimeline{
				_id
				counts{
					date
					count
				}
			}
		}
	`;

	export async function preload(page, session) {
		return { cache: await (await client.query({ query: q })).data };
    }
</script>

<script>
	// @ts-check

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

	@media (min-width: 480px) {
		h1 {
			font-size: 4em;
		}
	}
</style>

<svelte:head>
	<title>Snap Store architectures statistics | Snapstats.org</title>
	<meta name="description" content="Statistics about Snap Package supported architecture distribution within the Snap Store for Linux" />

	<!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Snap Store architectures statistics | Snapstats.org" />
    <meta property="og:description" content="Statistics about Snap Package supported architecture distribution within the Snap Store for Linux" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

	<!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="Snap Store architectures statistics | Snapstats.org" />
    <meta name="twitter:description" content="Statistics about Snap Package supported architecture distribution within the Snap Store for Linux" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

<div>
{#await $data}
	<p>Loading...</p>
{:then result}
	<h1>Architectures</h1>
	<DonateBtn/>
	<Timeline title="Architectures timeline" data={result.data.architectureTimeline} />
	<a href="/">Go back to the homepage...</a>
{/await}
</div>
