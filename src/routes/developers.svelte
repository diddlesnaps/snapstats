<script context="module">
	// @ts-check

	import { gql } from '@apollo/client/core';
	import {client} from '../apollo';

	import DonateBtn from '../components/DonateBtn.svelte';

	const q = gql`
		query {
			developerCountsByDate(query:{}){
				_id
				developerCounts{
					total
					mean
					mode
					median
				}
			}
			findSnapsCount(developerValidated:true){
				count
			}
			verifiedDeveloperCount{
				count
			}
			verifiedDevelopers{
				_id
				publisher_username
			}
		}
	`

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

<svelte:head>
	<title>Snap Store developers statistics | Snapstats.org</title>
	<meta name="description" content="Statistics about Snap Package developers within the Snap Store for Linux" />

	<!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Snap Store developers statistics | Snapstats.org" />
    <meta property="og:description" content="Statistics about Snap Package developers within the Snap Store for Linux" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

	<!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledani" />
    <meta name="twitter:title" content="Snap Store developers statistics | Snapstats.org" />
    <meta name="twitter:description" content="Statistics about Snap Package developers within the Snap Store for Linux" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

<style>
	.verified:after {
		content: '✓';
		color: #0a0;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		list-style: none;
		padding-left: initial;
	}
</style>

<div>
{#if $result.loading}
	<p>Loading...</p>
{:else if $result.error}
	<p>Error...</p>
{:else}
	<h1>Developers</h1>

	{#if ($result.data.developerCountsByDate.length > 0 && $result.data.developerCountsByDate[0].developerCounts.length > 0)}
		<p>There are <strong>{$result.data.developerCountsByDate[0].developerCounts[0].total || 0}</strong> developers who have published at least one snap.</p>
	{:else}
		<p>There are an unknown number of developers who have published at least one snap.</p>
	{/if}

	<p>
		Developers with published Snaps have each published an average (<a href="https://en.wikipedia.org/wiki/Arithmetic_mean">mean</a>) of <strong>{$result.data.developerCountsByDate[0].developerCounts[0].mean || 0}</strong> Snaps.
		The most common number of Snaps published per developer (<a href="https://en.wikipedia.org/wiki/Mode_(statistics)">mode</a>) is <strong>{$result.data.developerCountsByDate[0].developerCounts[0].mode || 0}</strong>.
	</p>

	<DonateBtn/>

	{#if $result.data.verifiedDevelopers.length > 0}
		<h2>Verified Developers</h2>
		<p>Below is a list of the <strong>{$result.data.verifiedDeveloperCount.count}</strong> known <span class='verified'>Verified</span> developers. Between them they have published <strong>{$result.data.findSnapsCount.count}</strong> Snaps:</p>
		<ul>
			{#each $result.data.verifiedDevelopers as developer}
			{@debug developer}
				<li><a href="/publishers/{developer.publisher_username}">{developer._id}</a></li>
			{/each}
		</ul>
	{/if}
{/if}
</div>
