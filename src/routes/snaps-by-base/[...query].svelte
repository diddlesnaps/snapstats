<script context="module">
    // @ts-check

    import SnapList from '../../components/SnapList.svelte';
    import Pagination from '../../components/Pagination.svelte';

	import client from '../../apollo';
    import { gql } from 'apollo-boost';

    const limit = 20

    const queryFields = `
        snap_id
        package_name
        title
        summary
        icon_url
        ratings_average
    `;

    const searchQuery = gql`
        query($base: String!, $offset: Int!, $limit: Int!){
            findSnapsByBase(base:$base, query:{offset:$offset, limit:$limit}){
                ${queryFields}
            }
            findSnapsByBaseCount(base:$base){
                count
            }
        }
    `;

    export async function preload({params}, session) {
        let [base, page] = params.query;

        let offset = (parseInt(page) || 0) * limit

        let data = client.query({
            query: searchQuery,
            variables: {base, offset, limit},
        });

        return {
            base,
            qlQuery: searchQuery,
            offset,
            limit,
            cache: (await data).data,
        };
    }
</script>

<script>
    // @ts-check

	import { setClient, restore, query } from 'svelte-apollo';

    export let base;
    export let qlQuery;
    export let offset;
    export let limit;
    export let cache;

	restore(client, qlQuery, cache);
	setClient(client);

    let data = query(client, {
        query: qlQuery,
        variables: {base, offset, limit}
    });

    $: data.refetch({ base, offset, limit })

    let getPageUrl = (page) => `/snaps-by-base/${base}/${page}`;
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
    <meta name="twitter:creator" content="@diddledan" />
    <meta name="twitter:title" content="Snaps using base snap '{base}'" />
    <meta name="twitter:description" content="Snaps in the Snap Store using base snap '{base}' found by SnapStats.org" />
    <meta name="twitter:image" content="/favicons/android-icon-512x512.png" />
</svelte:head>

{#await $data}
    <p>Loading...</p>
{:then result}
    <h1>Snaps using base snap '{base}':</h1>
    <SnapList snaps={result.data.findSnapsByBase} />
    <Pagination count={result.data.findSnapsByBaseCount.count} {limit} {offset} {getPageUrl} />
{/await}

<a href="/bases">Go back to the bases list</a>, or {' '}
<a href="/">go back to the homepage</a>.
