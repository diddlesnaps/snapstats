<script context="module">
    // @ts-check

    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

    import { gql } from '@apollo/client/core';
	import {client} from '../../apollo';

    // const latestQuery = gql`
    //     query($offset: Int!, $limit: Int!){
    //         snapsByDate(query:{limit:$limit, offset:$offset}){
    //             ${queryFields}
    //         }
    //         snapsByDateCount{
    //             count
    //         }
    //     }
    // `;

    const searchQuery = gql`
        query($q: String!, $offset: Int!, $limit: Int!, $field: String!, $order: Int!){
            findSnapsByName(name:$q, query:{offset:$offset, limit:$limit, sort:{field:$field,order:$order}}){
                snap_id
                package_name
                title
                summary
                icon_url
                ratings_average
            }
            findSnapsByNameCount(name:$q){
                count
            }
        }
    `;

    export async function preload({query: {q, field, order, offset, limit}}) {
        q ??= '';
        field ??= 'date_published';
        order = order ? parseInt(order) || -1 : -1;
        offset = offset ? parseInt(offset) || 0 : 0;
        limit = limit ? parseInt(limit) || 20 : 20;

        return {
            q,
            field,
            order,
            offset,
            limit,
            cache: (await client.query({
                // query: q ? searchQuery : latestQuery,
                query: searchQuery,
                variables: {q, field, order, offset, limit},
            })).data,
        };
    }
</script>

<script>
    // @ts-check

    import { goto } from '@sapper/app';
    import { setClient, restore, query } from 'svelte-apollo';
	import {advertisingEnabled} from '../../stores.js'

    export let q;
    export let field;
    export let order;
    /** @type {number} */
    export let offset;
    /** @type {number} */
    export let limit;
    export let cache;

	setClient(client);
	restore(searchQuery, cache);

    let result = query(searchQuery, {
        variables: {q, field, order, offset, limit}
    });

    $: {
        if (process.browser){
            globalThis.firebase?.analytics().logEvent('search', {
                search_term: q,
                page: offset / limit,
            });

            goto(`/snaps?q=${q}&offset=${offset}&limit=${limit}&field=${field}&order=${order}`)
            result.refetch({q, offset, limit, field, order})
        }
    }

    let getPageUrl = (page) => `/snaps?q=${q}&offset=${limit*page}&limit=${limit}&field=${field}&order=${order}`;
</script>

<style>
label {
    display: block;
}
.search input {
    border-radius: 2rem;
    box-sizing: border-box;
    display: block;
    font-size: 1.5rem;
    margin: 0.4rem 0 2rem;
    padding: 1rem 2rem;
    width: 100%;
}
/* .rssicon {
    background-color: orange;
    border-radius: 0.4rem;
} */
</style>

<svelte:head>
	<title>Search the Snap Store</title>
    <meta name="description" content="Search the Snap Store listings on SnapStats.org" />

    <!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Search the Snap Store" />
    <meta property="og:description" content="Search the Snap Store listings on SnapStats.org" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledani" />
    <meta name="twitter:title" content="Search the Snap Store" />
    <meta name="twitter:description" content="Search the Snap Store listings on SnapStats.org" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />

    <!-- Feed -->
    <link rel="alternate home" type="application/rss+xml" href="/snaps/feed.rss"
      title="RSS feed of new Snaps"/>
    <link rel="alternate home" type="application/atom+xml" href="/snaps/feed.atom"
      title="Atom feed of new Snaps"/>
    <link rel="alternate home" type="application/activitystream+json" href="/snaps/feed.json"
      title="Activity Streams JSON feed of new Snaps"/>

    {#if $advertisingEnabled}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8255474170399666"
            crossorigin="anonymous"></script>
    {/if}
</svelte:head>

<h1>Search the Snap Store</h1>
<div class='search'>
    <form method="get">
        <input name="offset" type="hidden" value='0' />
        <input name="limit" type="hidden" value={limit} />
        <label>Sort by <select name="field" bind:value={field}>
            <option value="">Relevance</option>
            <option value="date_published">First publish date</option>
            <option value="package_name">Name</option>
            <option value="title">Title</option>
        </select></label>
        <label>Order <select name="order" bind:value={order}>
            <option value={1}>Ascending</option>
            <option value={-1}>Descending</option>
        </select></label>
        <label>Enter a term to search
            <input name="q" type="text" value={q} placeholder="spotify"
                on:blur={(e) => {
                    q = e.currentTarget.value;
                    field = "";
                    order = -1;
                }} />
        </label>
    </form>
</div>

<div>
{#if $result.loading}
	<p>Loading...</p>
{:else if $result.error}
	<p>Error...</p>
{:else}
    <!-- {#if 'findSnapsByNameCount' in result.data } -->
        <h2>Search results:</h2>
        <SnapList snaps={$result.data?.findSnapsByName} />
        <Pagination count={$result.data?.findSnapsByNameCount.count} {limit} {offset} {getPageUrl} />
    <!-- {:else}
        <h2>Newest Snaps: <a href="/snaps/feed.rss"><img class="rssicon" src="/rssfeed.svg" title="Newest Snaps RSS feed" alt="RSS feed"></a></h2>
        <SnapList snaps={result.data.snapsByDate} />
        <Pagination count={result.data.snapsByDateCount.count} {limit} {offset} {getPageUrl} />
    {/if} -->
{/if}
</div>

<a href="/">Go back to the homepage</a>