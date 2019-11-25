<script context="module">
	import client from '../../apollo';
    import { gql } from 'apollo-boost';

    const q = gql`
        query($slug:String!) {
            snapByName(name:$slug) {
                architecture
                categories
                contact
                date_published
                description
                icon_url
                last_updated
                license
                package_name
                publisher
                ratings_average
                screenshot_urls
                summary
                title
                version
                website
            }
        }
    `;

    export async function preload(page, session) {
        const {slug} = page.params;

        return { cache: await client.query({ query: q, variables: {slug} }) };
    }
</script>

<script>
    if (process.browser) {
        import('fslightbox');
    }
    import marked from 'marked';
    import createDOMPurify from 'dompurify';
    const DOMPurify = createDOMPurify(window);
    const DOMPurifyOpts = {
        ALLOWED_TAGS: [
            'a',
            'p', '#text', 'br', 'code', 'pre',
            'em', 'strong', 'b', 'i',
            'li', 'ul', 'ol',
            'table', 'tr', 'td', 'tbody', 'thead',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        ],
        KEEP_CONTENT: true,
    };

    DOMPurify.addHook('afterSanitizeAttributes', function(node) {
        if (node.hasAttribute('href')) {
            const href = node.getAttribute('href');
            if (href.startsWith('.') || href.startsWith('#')) {
                node.removeAttribute('href');
            }
            node.setAttribute('rel', 'nofollow ugc');
        }
    });

	import { setClient, restore, query } from 'svelte-apollo';

	export let cache;

	restore(client, q, cache.data);
	setClient(client);
	let data = query(client, { query: q });
</script>

<style>
.snapinfo {
    display: flex;
    flex-direction: column;
}
@media screen and (min-width: 720px) {
    .snapinfo {
        display: initial;
    }
}
.bannerImage {
    max-width: 100%;
}
.banner {
    align-items: center;
    display: flex;
    flex-direction: row;
    height: 240px;
    justify-content: center;
}
.banner > div {
    display: flex;
    flex-direction: column;
}
.banner > img {
    margin-right: 1em;
    max-width: 128px;
}
.title {
    line-height: 1em;
    margin: 0.4em 0;
}
.version {
    font-size: 1.2rem;
    margin: 0.4em 0;
}
.summary {
    margin: 0.4em 0;
}
.screenshots {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    order: 1;
}
@media screen and (min-width: 720px) {
    .screenshots {
        margin-top: 5em;
    }
}
.screenshots img {
    margin: 2em 1em;
    max-height: 240px;
    max-width: calc(100vw - 2em);
}
.storeButton {
    text-align: center;
}
@media screen and (min-width: 720px) {
    .storeButton {
        text-align: right;
    }
}
.meta ul {
    background: #eeeeee;
    border: 2px dashed #888888;
    font-size: 0.7rem;
    order: 1;
    padding: 0.4em 1rem;
    max-width: 50rem;
    box-sizing: content-box;
    margin-left: auto;
    margin-right: auto;
}
.meta li {
    margin: 0 1rem;
    padding: 0;
}
</style>

<svelte:head>
    {#await $data}
        <title>Loading snap details...</title>
    {:then result}
        <title>{result.data.snapByName.title || result.data.snapByName.package_name}</title>
        <meta name="description"
            content="{`${result.data.snapByName.title || result.data.snapByName.package_name}: ${result.data.snapByName.summary}`}" />
    
        {@html '<script type="application/ld+json">' +
            JSON.stringify({
                "@context" : "http://schema.org",
                "@type" : "SoftwareApplication",
                "datePublished": new Date(result.data.snapByName.date_published).toISOString(),
                "dateModified": new Date(result.data.snapByName.last_updated).toISOString(),
                "name" : result.data.snapByName.title || result.data.snapByName.package_name,
                "publisher": result.data.snapByName.publisher,
                "applicationCategory": result.data.snapByName.categories,
                "softwareVersion": result.data.snapByName.version,
                "description": result.data.snapByName.summary,
                "operatingSystem": "Linux",
                "softwareRequirements": "Snapd",
                "processorRequirements": result.data.snapByName.architecture ? result.data.snapByName.architecture.join(', ') : '',
                "screenshot" : result.data.snapByName.screenshot_urls.filter(
                    url => !url.match(/\/banner(-icon)?_\w{7}.(png|jpg)$/)
                ),
                "downloadUrl" : `https://snapcraft.io/${result.data.snapByName.package_name}`,
            }) + `</${'script'}>`}
    {/await}
</svelte:head>

{#await $data}
    <p>Loading...</p>
{:then result}
    <div class='snapinfo'>
        {#if result.data.snapByName.screenshot_urls.find(
            url => /\/banner_\w{7}.(png|jpg)$/.test(url)
        )}
            <img class='bannerImage' loading="lazy"
                src={result.data.snapByName.screenshot_urls.find(
                    url => /\/banner_\w{7}.(png|jpg)$/.test(url)
                )} 
                alt={`${result.data.snapByName.title || result.data.snapByName.package_name} banner`} />
        {/if}
        <div class='banner'>
            {#if result.data.snapByName.icon_url}
                <img height="128" loading="lazy"
                    src={result.data.snapByName.icon_url}
                    alt={`Icon for ${result.data.snapByName.title || result.data.snapByName.package_name}`} />
            {/if}
            <div>
                <h1 class='title'>{result.data.snapByName.title || result.data.snapByName.package_name}</h1>
                <p class='version'>Version {result.data.snapByName.version}</p>
                <p class='summary'>{result.data.snapByName.summary}</p>
            </div>
        </div>
        {#if
            // if any of these are present then display the meta box.
            result.data.snapByName.architecture ||
            result.data.snapByName.category ||
            result.data.snapByName.license ||
            result.data.snapByName.website ||
            result.data.snapByName.contact ||
            result.data.snapByName.date_published ||
            result.data.snapByName.last_updated
        }
            <aside class='meta'>
                <ul>
                    {#if result.data.snapByName.architecture}
                        <li>
                            Architectures supported:
                            {#if result.data.snapByName.architecture}
                                {result.data.snapByName.architecture.join(', ')}
                            {:else}
                                none
                            {/if}
                        </li>
                    {/if}
                    {#if result.data.snapByName.categories}
                        <li>
                            Category: {result.data.snapByName.categories.join(', ')}
                        </li>
                    {/if}
                    {#if result.data.snapByName.license}
                        <li>
                            License: {result.data.snapByName.license}
                        </li>
                    {/if}
                    {#if result.data.snapByName.website}
                        <li>
                            Application website: <a href={result.data.snapByName.website}>{result.data.snapByName.website}</a>
                        </li>
                    {/if}
                    {#if result.data.snapByName.contact}
                        <li>
                            Snap support contact: <a href={result.data.snapByName.contact}>{result.data.snapByName.contact}</a>
                        </li>
                    {/if}
                    {#if result.data.snapByName.date_published}
                        <li>
                            Published on
                            <time dateTime={new Date(result.data.snapByName.date_published).toISOString()}>
                                {new Date(result.data.snapByName.date_published).toLocaleString()}
                            </time>
                        </li>
                    {/if}
                    {#if result.data.snapByName.last_updated}
                        <li>
                            Last modified on
                            <time dateTime={new Date(result.data.snapByName.last_updated).toISOString()}>
                                {new Date(result.data.snapByName.last_updated).toLocaleString()}
                            </time>
                        </li>
                    {/if}
                </ul>
            </aside>
        {/if}

        {@html DOMPurify.sanitize(marked(result.data.snapByName.description), DOMPurifyOpts)}

        {#if result.data.snapByName.screenshot_urls.filter(
            url => !url.match(/\/banner(-icon)?_\w{7}.(png|jpg)$/)
        ).length > 0}
            <div class='screenshots'>
                {#each result.data.snapByName.screenshot_urls.filter(
                    url => !url.match(/\/banner(-icon)?_\w{7}.(png|jpg)$/)
                ) as screenshot}
                    <a data-fslightbox="screenshots" href={`https://res.cloudinary.com/canonical/image/fetch/${screenshot}`}>
                        <img loading="lazy" height="240"
                            src={`https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_240/${screenshot}`}
                            alt={`${result.data.snapByName.title || result.data.snapByName.package_name} screenshot`} />
                    </a>
                {/each}
            </div>
        {/if}

        <p class='storeButton'>
            <a href={`https://snapcraft.io/${result.data.snapByName.package_name}`}>
                <img alt="Get it from the Snap Store"
                    src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" />
            </a>
        </p>
    </div>
{/await}

<a href="snaps">Search for another snap</a>, or{' '}
<a href="/">go back to the homepage</a>
