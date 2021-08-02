<script context="module">
	// @ts-check

    import DonateBtn from '../components/DonateBtn.svelte';
	import Timeline from '../components/Timeline.svelte';

	import { gql } from '@apollo/client/core';
	import {client} from '../apollo';

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
		return { cache: await (await client.query({ query: q })).data };
    }
</script>

<script>
	// @ts-check

	import { setClient, restore, query } from 'svelte-apollo';

	export let cache;

	setClient(client);
	restore(q, cache);
	let result = query(q);
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

	<!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Snap Store channels statistics | Snapstats.org" />
    <meta property="og:description" content="Statistics about Snap Package channels within the Snap Store for Linux" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

	<!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledani" />
	<meta name="twitter:title" content="Snap Store channels statistics | Snapstats.org" />
    <meta name="twitter:description" content="Statistics about Snap Package channels within the Snap Store for Linux" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

<div>
{#if $result.loading}
	<p>Loading...</p>
{:else if $result.error}
	<p>Error...</p>
{:else}
	<h1>Channels</h1>
	<DonateBtn/>
	<Timeline title="Channels timeline" data={$result.data?.channelTimeline} />
	<a href="/">Go back to the homepage...</a>
{/if}
</div>
