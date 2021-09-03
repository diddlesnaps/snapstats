<script context="module">
    // @ts-check

    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

    import { gql } from '@apollo/client/core';
	import {client} from '../../apollo';

    const limit = 20

    const searchQuery = gql`
        query($base: String!, $offset: Int!, $limit: Int!, $field: String!, $order: Int!){
            findSnapsByBase(base:$base, query:{offset:$offset, limit:$limit, sort:{field:$field,order:$order}}){
                snap_id
                package_name
                title
                summary
                icon_url
                ratings_average
            }
            findSnapsByBaseCount(base:$base){
                count
            }
        }
    `;

    export async function preload({params: {query: [base, page]}, query: {field, order}}, session) {
        let offset = parseInt(page) * limit;
        base ??= '';
        field ??= 'title';
        order = order ? parseInt(order) || 1 : 1;

        let data = client.query({
            query: searchQuery,
            variables: {base, field, order, offset, limit},
        });

        return {
            base,
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
    import { setClient, restore, query } from 'svelte-apollo';

    /** @type {string} */
    export let base;
    /** @type {string} */
    export let field;
    /** @type {number} */
    export let order;
    /** @type {number} */
    export let page;
    export let cache;

	setClient(client);
	restore(searchQuery, cache);

    let result = query(searchQuery, {
        variables: {base, field, order, offset: page*limit, limit}
    });

    $: {
        if (process.browser) {
            goto(`/snaps-by-base/${base}/${page}?field=${field}&order=${order}`);
            result.refetch({ base, field, order, offset: page*limit, limit })
            globalThis.firebase?.analytics().logEvent('showSnapsByBasePage', {
                base,
                page,
            });
        }
    }

    let getPageUrl = (page) => `/snaps-by-base/${base}/${page}?field=${field}&order=${order}`;
</script>

<svelte:head>
	<title>Search the Snap Store</title>
    <meta name="description" content="Snaps in the Snap Store using base snap '{base}' found by SnapStats.org" />

    <!-- Facebook -->
    <meta property="og:site_name" content="Snapstats.org" />
	<meta property="fb:app_id" content="2603641926537298" />
	<meta property="og:type" content="website" />
    <meta property="og:title" content="Snaps using base snap '{base}'" />
    <meta property="og:description" content="Snaps in the Snap Store using base snap '{base}' found by SnapStats.org" />
    <meta property="og:image" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:secure_url" content="/favicons/android-icon-512x512.png" />
    <meta property="og:image:width" content="512" />
    <meta property="og:image:height" content="512" />
    <meta property="og:image:alt" content="Icon of Snapstats.org" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:site" content="@snapstats_org" />
    <meta name="twitter:creator" content="@diddledani" />
    <meta name="twitter:title" content="Snaps using base snap '{base}'" />
    <meta name="twitter:description" content="Snaps in the Snap Store using base snap '{base}' found by SnapStats.org" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

<h1>Snaps using base snap '{base}':</h1>
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
    <SnapList snaps={$result.data?.findSnapsByBase} />
    <Pagination count={$result.data?.findSnapsByBaseCount.count} {limit} offset={page*limit} {getPageUrl} />
{/if}

<a href="/bases">Go back to the bases list</a>, or {' '}
<a href="/">go back to the homepage</a>.
