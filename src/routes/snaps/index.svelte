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
        ratings_average
    `;

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
                ${queryFields}
            }
            findSnapsByNameCount(name:$q){
                count
            }
        }
    `;

    export async function preload(page, session) {
        let {query} = page;
        let {q, field, order, offset, limit} = query;

        q = q || '';
        field = field || 'date_published';
        order = order ? parseInt(order) || -1 : -1;
        offset = offset ? parseInt(offset) || 0 : 0;
        limit = limit ? parseInt(limit) || 20 : 20;

        let data = client.query({
            // query: q ? searchQuery : latestQuery,
            query: searchQuery,
            variables: {q, field, order, offset, limit},
        });

        return {
            q,
            field,
            order,
            // qlQuery: q ? searchQuery : latestQuery,
            qlQuery: searchQuery,
            offset,
            limit,
            cache: (await data).data,
        };
    }
</script>

<script>
	import { setClient, restore, query } from 'svelte-apollo';

    export let q;
    export let field;
    export let order;
    export let qlQuery;
    export let offset;
    export let limit;
    export let cache;

	restore(client, qlQuery, cache);
	setClient(client);

    let data = query(client, {
        query: qlQuery,
        variables: {q, field, order, offset, limit}
    });

    let getPageUrl = (page) => `snaps?q=${q}&offset=${limit*page}&limit=${limit}&field=${field}&order=${order}`;

    function submit(e) {
        const field = document.querySelector('select[name="field"]').value || 'date_published'
        const order = parseInt(document.querySelector('select[name="order"]').value) || -1
        if (typeof firebase !== 'undefined' && firebase) {
            firebase.analytics().logEvent('search', {
                search_term: q,
            });
        }
        window.location = `/snaps?q=${q}&offset=${offset}&limit=${limit}&field=${field}&order=${order}`
        data.refetch({q, field, order, offset, limit})
    }
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
    margin: 4rem 0;
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
    <meta name="twitter:creator" content="@diddledan" />
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
</svelte:head>

<h1>Search the Snap Store</h1>
<div class='search'>
    <form method="get" on:submit={submit}>
        <input name="offset" type="hidden" value='0' />
        <input name="limit" type="hidden" value={limit} />
        <label>Sort by <select name="field" on:blur={submit}>
            <option value="date_published">Date</option>
            <option value="package_name">Name</option>
            <option value="title">Title</option>
        </select></label>
        <label>Order <select name="order" on:blur={submit}>
            <option value="1" selected={order === 1}>Ascending</option>
            <option value="-1" selected={!order || order === -1}>Descending</option>
        </select></label>
        <label>Enter a term to search
            <input name="q" id="search" type="text" value={q}
                placeholder="spotify" />
        </label>
    </form>
</div>

{#await $data}
    <p>Loading...</p>
{:then result}
    <!-- {#if 'findSnapsByNameCount' in result.data } -->
        <h2>Search results:</h2>
        <SnapList snaps={result.data.findSnapsByName} />
        <Pagination count={result.data.findSnapsByNameCount.count} {limit} {offset} {getPageUrl} />
    <!-- {:else}
        <h2>Newest Snaps: <a href="/snaps/feed.rss"><img class="rssicon" src="/rssfeed.svg" title="Newest Snaps RSS feed" alt="RSS feed"></a></h2>
        <SnapList snaps={result.data.snapsByDate} />
        <Pagination count={result.data.snapsByDateCount.count} {limit} {offset} {getPageUrl} />
    {/if} -->
{/await}

<a href="/">Go back to the homepage</a>