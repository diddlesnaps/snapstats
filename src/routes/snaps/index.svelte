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
            offset,
            limit,
            cache: await data,
        };
    }
</script>

<script>
    import { restore, query } from 'svelte-apollo';

    export let q;
    export let offset;
    export let limit;
    export let cache;

	restore(client, q ? searchQuery : latestQuery, cache.data);
    let data = query(client, {
        query: q ? searchQuery : latestQuery,
        variables: {q, offset, limit}
    });

    let getPageUrl = (page) => `snaps?q=${q}&offset=${limit*page}&limit=${limit}`;

    $: data.refetch({q, offset, limit});
</script>

<style>
.search input {
    border-radius: 2rem;
    border: 0;
    box-shadow: 0px 2px 10px -2px;
    display: block;
    font-size: 1.5rem;
    margin: 6rem 4rem;
    padding: 1rem 2rem;
    width: calc(100% - 8rem);
}
</style>

<svelte:head>
	<title>Search the snap store</title>
    <meta name="description" content="Search the snap store listings on SnapStats.org" />
</svelte:head>

<h1>Search the snap store</h1>
<div class='search'>
    <form method="get">
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
    {#if q}
        <SnapList snaps={result.data.findSnapsByName} />
        <Pagination count={result.data.findSnapsByNameCount.count} {limit} {offset} {getPageUrl} />
    {:else}
        <SnapList snaps={result.data.snapsByDate} />
        <Pagination count={result.data.snapsByDateCount.count} {limit} {offset} {getPageUrl} />
    {/if}
{/await}

<a href="/">Go back to the homepage</a>