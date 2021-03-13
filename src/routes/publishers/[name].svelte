<script context="module">
    // @ts-check

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

    const searchQuery = gql`
        query($publisherName: String!, $offset: Int!, $limit: Int!, $field: String!, $order: Int!){
            findSnaps(publisherOrDeveloper:$publisherName, query:{offset:$offset, limit:$limit, sort:{field:$field,order:$order}}){
                ${queryFields}
            }
            findSnapsCount(publisherOrDeveloper:$publisherName){
                count
            }
        }
    `;

    export async function preload(page, session) {
        let {query} = page;
        let {name: publisherName} = page.params
        let {field, order, offset, limit} = query;

        publisherName = publisherName || '';
        field = field || 'package_name';
        order = order ? parseInt(order) || -1 : -1;
        offset = offset ? parseInt(offset) || 0 : 0;
        limit = limit ? parseInt(limit) || 20 : 20;

        let data = client.query({
            query: searchQuery,
            variables: {publisherName, field, order, offset, limit},
        });

        return {
            publisherName,
            field,
            order,
            offset,
            limit,
            cache: (await data).data,
        };
    }
</script>

<script>
    // @ts-check

    import { goto } from '@sapper/app';
    import { onMount } from 'svelte';
    import { setClient, restore, query } from 'svelte-apollo';

    export let publisherName;
    export let field;
    export let order;
    /** @type {number} */
    export let offset;
    /** @type {number} */
    export let limit;
    export let cache;

	restore(client, searchQuery, cache);
	setClient(client);

    let data = query(client, {
        query: searchQuery,
        variables: {publisherName, field, order, offset, limit}
    });

    let mounted = false;

    $: {
        globalThis.firebase?.analytics().logEvent('showPublisherPage', {
            publisher_name: publisherName,
            page: offset / limit,
        });
        
        const search = `offset=${offset}&limit=${limit}&field=${field}&order=${order}`
        if (mounted) {
            goto(`publishers/${publisherName}?${search}`)
            data.refetch({offset, limit, field, order})
        }
    }

    let getPageUrl = (page) => `publishers/${publisherName}?offset=${limit*page}&limit=${limit}&field=${field}&order=${order}`;

    onMount(() => {
        mounted = true;
    })
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
	<title>Snap packages by {publisherName}</title>
    <meta name="description" content="Snap packages by {publisherName} on SnapStats.org" />

    <!-- Facebook -->
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Snap Packages by {publisherName}" />
    <meta property="og:description" content="Snap Packages by {publisherName} on SnapStats.org" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="Snap packages by {publisherName}" />
    <meta name="twitter:description" content="Snap packages by {publisherName} on SnapStats.org" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />

    <!-- Feed -->
    <link rel="alternate home" type="application/rss+xml" href="/publishers/{publisherName}.rss"
      title="RSS feed of new Snaps by {publisherName}"/>
    <link rel="alternate home" type="application/atom+xml" href="/publishers/{publisherName}.atom"
      title="Atom feed of new Snaps by {publisherName}"/>
    <link rel="alternate home" type="application/activitystream+json" href="/publishers/{publisherName}.json"
      title="Activity Streams JSON feed of new Snaps by {publisherName}"/>
</svelte:head>

<h1>Snaps by {publisherName}</h1>
<div class='search'>
    <form method="get">
        <input name="offset" type="hidden" value='0' />
        <input name="limit" type="hidden" value={limit} />
        <label>Sort by <select name="field" bind:value={field}>
            <option value="date_published">First publish date</option>
            <option value="package_name">Name</option>
            <option value="title">Title</option>
        </select></label>
        <label>Order <select name="order" bind:value={order}>
            <option value={1}>Ascending</option>
            <option value={-1}>Descending</option>
        </select></label>
    </form>
</div>

{#await $data}
    <p>Loading...</p>
{:then result}
        <h2>Snaps by {publisherName}:</h2>
        <SnapList snaps={result.data.findSnaps} />
        <Pagination count={result.data.findSnapsCount.count} {limit} {offset} {getPageUrl} />
{/await}

<a href="/">Go back to the homepage</a>