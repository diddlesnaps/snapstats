<script context="module">
    // @ts-check

    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

    import { gql } from '@apollo/client/core';
	import {client} from '../../apollo';

    const limit = 20;

    const q = gql`
        query($publisherName: String!, $offset: Int!, $limit: Int!, $field: String!, $order: Int!){
            findSnaps(publisherOrDeveloper:$publisherName, query:{offset:$offset, limit:$limit, sort:{field:$field,order:$order}}){
                snap_id
                package_name
                title
                summary
                icon_url
                ratings_average
            }
            findSnapsCount(publisherOrDeveloper:$publisherName){
                count
            }
        }
    `;

    export async function preload({params: {query: [publisherName, page]}, query: {field, order}}, session) {
        page ??= 0;
        publisherName ??= '';
        let offset = parseInt(page) * limit;
        field ??= 'title';
        order = order ? parseInt(order) || 1 : 1;

        let data = client.query({
            query: q,
            variables: {publisherName, field, order, offset, limit},
        });

        return {
            publisherName,
            field,
            order,
            page: parseInt(page),
            cache: (await data).data,
        };
    }
</script>

<script>
    // @ts-check

    import { goto } from '@sapper/app';
    import { setClient, query } from 'svelte-apollo';
	import {advertisingEnabled} from '../../stores.js'

    /** @type {string} */
    export let publisherName;
    /** @type {string} */
    export let field;
    /** @type {number} */
    export let order;
    /** @type {number} */
    export let page;
    export let cache;

	setClient(client);
    client.writeQuery({query: q, data: cache})

    let result = query(q, {
        variables: {publisherName, field, order, offset: page*limit, limit}
    });

    $: {
        if (process.browser) {
            goto(`/publishers/${publisherName}/${page}?field=${field}&order=${order}`);
            result.refetch({ publisherName, field, order, offset: page*limit, limit })
            globalThis.firebase?.analytics().logEvent('showPublisherPage', {
                publisherName,
                page,
            });
        }
    }

    let getPageUrl = (page) => `/publishers/${publisherName}/${page}?field=${field}&order=${order}`;
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
    <meta property="og:site_name" content="Snapstats.org" />
    <meta property="fb:app_id" content="2603641926537298" />
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
    <meta name="twitter:site" content="@snapstats_org" />
    <meta name="twitter:creator" content="@diddledani" />
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

    {#if $advertisingEnabled}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8255474170399666"
            crossorigin="anonymous"></script>
    {/if}
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

{#if $result.loading}
	<p>Loading...</p>
{:else if $result.error}
	<p>Error...</p>
{:else}
    <SnapList snaps={$result.data?.findSnaps} />
    <Pagination count={$result.data?.findSnapsCount.count} {limit} offset={page*limit} {getPageUrl} />
{/if}

<a href="/">Go back to the homepage</a>
