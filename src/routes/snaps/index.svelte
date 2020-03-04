<script context="module">
    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

	import client from '../../apollo';
    import { gql } from 'apollo-boost';

    const queryFields = `
        snap_id
        package_name
        title
        summary
        icon_url
    `;

    const latestQuery = gql`
        query($offset: Int!, $limit: Int!){
            snapsByDate(query:{limit:$limit, offset:$offset}){
                ${queryFields}
            }
            snapsByDateCount{
                count
            }
        }
    `;

    const searchQuery = gql`
        query($q: String!, $offset: Int!, $limit: Int!){
            findSnapsByName(name:$q, query:{offset:$offset, limit:$limit}){
                ${queryFields}
            }
            findSnapsByNameCount(name:$q){
                count
            }
        }
    `;

    export async function preload(page, session) {
        let {query} = page;
        let {q, offset, limit} = query;

        q = q || '';
        offset = offset ? parseInt(offset) || 0 : 0;
        limit = limit ? parseInt(limit) || 20 : 20;

        let data = client.query({
            query: q ? searchQuery : latestQuery,
            variables: {q, offset, limit},
        });

        return {
            q,
            qlQuery: q ? searchQuery : latestQuery,
            offset,
            limit,
            cache: (await data).data,
        };
    }
</script>

<script>
	import { setClient, restore, query } from 'svelte-apollo';

    export let q;
    export let qlQuery;
    export let offset;
    export let limit;
    export let cache;

	restore(client, qlQuery, cache);
	setClient(client);

    let data = query(client, {
        query: qlQuery,
        variables: {q, offset, limit}
    });

    $: data.refetch({ q, offset, limit })

    let getPageUrl = (page) => `snaps?q=${q}&offset=${limit*page}&limit=${limit}`;

    function submit(e) {
        firebase.analytics().logEvent('search', {
            search_term: this.querySelector('input[name=q]').value,
        });
    }
</script>

<style>
.search input {
    border-radius: 2rem;
    box-sizing: border-box;
    display: block;
    font-size: 1.5rem;
    margin: 4rem 0;
    padding: 1rem 2rem;
    width: 100%;
}
</style>

<svelte:head>
	<title>Search the Snap Store</title>
    <meta name="description" content="Search the Snap Store listings on SnapStats.org" />

    <!-- Facebook -->
    <meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:app_id" content="2603641926537298" />
	<meta property="og:type" content="website" />
    <meta property="og:url" content="https://snapstats.org/snaps" />
    <meta property="og:title" content="Search the Snap Store" />
    <meta property="og:description" content="Search the Snap Store listings on SnapStats.org" />
    <meta property="og:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="https://snapstats.org/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@snapstats_org" />
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="Search the Snap Store" />
    <meta name="twitter:description" content="Search the Snap Store listings on SnapStats.org" />
    <meta name="twitter:image" content="https://snapstats.org/favicons/android-icon-512x512.png" />
</svelte:head>

<h1>Search the Snap Store</h1>
<div class='search'>
    <form method="get" on:submit={submit}>
        <input name="offset" type="hidden" value='0' />
        <input name="limit" type="hidden" value={limit} />
        <label for="search">Enter a term to search</label>
        <input name="q" id="search" type="text" value={q}
            placeholder="spotify" />
    </form>
</div>

{#await $data}
    <p>Loading...</p>
{:then result}
    <h2>Search results:</h2>
    {#if q}
        <SnapList snaps={result.data.findSnapsByName} />
        <Pagination count={result.data.findSnapsByNameCount.count} {limit} {offset} {getPageUrl} />
    {:else}
        <SnapList snaps={result.data.snapsByDate} />
        <Pagination count={result.data.snapsByDateCount.count} {limit} {offset} {getPageUrl} />
    {/if}
{/await}

<a href="/">Go back to the homepage</a>