<script context="module">
    // @ts-check

    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

    import { gql } from '@apollo/client/core';
	import {client} from '../../apollo';

    const limit = 20

    const searchQuery = gql`
        query($base: String!, $offset: Int!, $limit: Int!){
            findSnapsByBase(base:$base, query:{offset:$offset, limit:$limit}){
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

    export async function preload({params: [base, page], query: {field, order}}, session) {
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

    let data = query(searchQuery, {
        variables: {base, field, order, offset: page*limit, limit}
    });

    $: {
        if (process.browser) {
            data.refetch({ base, field, order, offset: page*limit, limit })
            goto(`/snaps-by-base/${base}/${page}?field=${field}&order=${order}`);
            globalThis.firebase?.analytics().logEvent('showPublisherPage', {
                base,
                page,
            });
        }
    }

    let getPageUrl = (page) => `/snaps-by-base/${base}/${page}?field=${field}&order=${order}`;
</script>

<svelte:head>
	<title>Search the Snap Store</title>
    <meta name="description" content="Search the Snap Store listings on SnapStats.org" />

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

{#await $data}
    <p>Loading...</p>
{:then result}
    <h1>Snaps using base snap '{base}':</h1>
    <SnapList snaps={result.data.findSnapsByBase} />
    <Pagination count={result.data.findSnapsByBaseCount.count} {limit} offset={page*limit} {getPageUrl} />
{/await}

<a href="/bases">Go back to the bases list</a>, or {' '}
<a href="/">go back to the homepage</a>.
