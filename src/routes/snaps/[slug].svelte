<script context="module">
    // @ts-check

	import {client} from '../../apollo';
    import { gql } from '@apollo/client/core'
    import StarRating from '../../components/StarRating.svelte'
    import DonateBtn from '../../components/DonateBtn.svelte'

    const q = gql`
        query($slug:String!) {
            snapByName(name:$slug) {
                architecture
                sections
                contact
                date_published
                description
                developer_name
                developer_username
                developer_validation
                icon_url
                last_updated
                license
                media{
                    url
                    type
                    width
                    height
                }
                name
                package_name
                publisher
                ratings_average
                ratings_count
                screenshot_urls
                summary
                title
                version
                website
            }
        }
    `;

    export async function preload(page, session) {
        const {slug} = page.params

        const result = await client.query({ query: q, variables: {slug} })
        const data = await result.data
        
        if (!data.snapByName) {
            this.error(404, `The Snap package '${slug}' is not in the latest snapshot of data from the Snap Store. Perhaps it has been unpublished.. 😭`)
        } else {
            return { cache: data }
        }
    }
</script>

<script>
    // @ts-check

    import { onMount } from 'svelte';
    import marked from 'marked'
    import createDOMPurify from 'dompurify'
    const DOMPurify = createDOMPurify(window)
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
            const href = node.getAttribute('href')
            if (href.startsWith('.') || href.startsWith('#')) {
                node.removeAttribute('href')
            }
            node.setAttribute('rel', 'nofollow ugc')
        }
    })

	import { setClient, restore, query } from 'svelte-apollo'

    export let cache

	restore(client, q, cache)
	setClient(client)
    let data = query(client, { query: q })

    let video

    onMount(async () => {
        const result = await $data
        if (result.data.snapByName.media) {
            video = result.data.snapByName.media.filter(m => m.type === 'video').shift()
            if (typeof video === 'object' && 'url' in video) {
                if (video.url.match(/youtube/)) {
                    video.url = video.url.replace('watch?v=', 'embed/')
                    video.type = 'youtube'
                }
                if (video.url.match(/youtu\.be/)) {
                    video.url = video.url.replace('youtu.be', 'youtube.com/embed/')
                    video.type = 'youtube'
                }
                if (video.url.match(/vimeo/)) {
                    video.url = video.url.replace('vimeo.com/', 'player.vimeo.com/video/')
                    video.type = 'vimeo'
                }
                if (video.url.match(/asciinema/)) {
                    video.url = video.url + '.js'
                    video.type = 'asciinema'
                }
                video.url = video.url.replace('http://', 'https://')
            }
        }
        await import('fslightbox')
        globalThis.refreshFsLightbox()
    })

    function vimeo() {
        const vimeoPlayerScript = document.createElement("script");
        vimeoPlayerScript.src = "";
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(vimeoPlayerScript, firstScript);
    }
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
    height: auto;
}
.banner {
    display: grid;
    gap: 0.3rem 0.6rem;
    grid-template-areas:
        "title"
        "icon"
        "rating"
        "version"
        "summary";
}
.icon {
    grid-area: icon;
    display: grid;
    align-items: center;
    justify-content: center;
}
.title {
    text-align: center;
    grid-area: title;
    line-height: 1em;
    margin: 0;
}
.rating {
    display: flex;
    justify-content: center;
    grid-area: rating;
    margin: 0;
}
.version {
    text-align: center;
    grid-area: version;
    font-size: 1.2rem;
    margin: 0;
}
.summary {
    grid-area: summary;
    margin: 0;
}
@media screen and (min-width: 360px) {
    .banner {
        grid-template-areas:
            "icon title"
            "icon rating"
            "icon version"
            "icon summary";
    }
    .title {
        text-align: initial;
    }
    .rating {
        display: initial;
    }
    .version {
        text-align: initial;
    }
}

.screenshots-wrapper {
    order: 1;
}
.screenshots {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
}
.screenshots img {
    max-height: 240px;
    max-width: 100%;
    margin: 0 0.6rem;
}

@media screen and (min-width: 640px) {
    .screenshots img {
        max-width: calc(50vw - 3rem);
    }
}

.storeButton {
    text-align: center;
}
@media screen and (min-width: 720px) {
    .storeButton {
        text-align: right;
    }
}
.storeButton img {
    border-radius: 1rem;
}

.meta dl {
    color: #000000;
    background: rgba(135, 190, 161, 0.4); /* #87bea1; */
    border-radius: 0rem 2rem 2rem 0rem;
    font-size: 0.7rem;
    line-height: 1.2rem;
    order: 1;
    padding: 0.4em 1rem;
    max-width: 50rem;
    box-sizing: content-box;
    margin-left: auto;
    margin-right: auto;
}
@media screen and (min-width: 360px) {
    .meta dl {
        display: grid;
        gap: 0 0.4rem;
        grid-template-columns: minmax(min-content, max-content) auto;
    }
    .meta dd {
        margin: 0;
    }
}

.verified:before {
    content: '✔️';
    color: #2a2;
}
</style>

<svelte:head>
    {#await $data}
        <title>Loading snap details...</title>
    {:then result}
        <title>{result.data.snapByName.title || result.data.snapByName.package_name}</title>
        <meta name="description" content="{result.data.snapByName.summary}" />

        <!-- Facebook -->
	    <meta property="og:type" content="product" />
        <meta property="og:title" content="{result.data.snapByName.title || result.data.snapByName.package_name}" />
        <meta property="og:description" content="{result.data.snapByName.summary}" />
        <meta property="og:image" content="{result.data.snapByName.icon_url}" />
        <meta property="og:image:secure_url" content="{result.data.snapByName.icon_url}" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />
        <meta property="og:image:alt" content="Icon of {result.data.snapByName.title || result.data.snapByName.package_name}" />

        <!-- Twitter -->
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="{result.data.snapByName.title || result.data.snapByName.package_name}" />
        <meta name="twitter:description" content="{result.data.snapByName.summary}" />
        <meta name="twitter:image" content="{result.data.snapByName.icon_url}" />
        <meta name="twitter:image:alt" content="Icon of {result.data.snapByName.title || result.data.snapByName.package_name}" />

        <!-- Schema.org -->
        {@html `<${'script'} type="application/ld+json">
            ${JSON.stringify({
                "@context" : "http://schema.org",
                "@type" : "SoftwareApplication",
                "dateModified": new Date(result.data.snapByName.last_updated).toISOString(),
                "name" : result.data.snapByName.title || result.data.snapByName.package_name,
                "image" : result.data.snapByName.icon_url,
                "publisher": {
                    "@type": "Person",
                    "name": result.data.snapByName.developer_name || result.data.snapByName.publisher,
                    "url": result.data.snapByName.website,
                },
                "applicationCategory": result.data.snapByName.sections ? result.data.snapByName.sections.join(', ') : [],
                "softwareVersion": result.data.snapByName.version,
                "license": result.data.snapByName.license,
                "description": result.data.snapByName.summary,
                "operatingSystem": "Linux",
                "softwareRequirements": "Snapd",
                "processorRequirements": result.data.snapByName.architecture ? result.data.snapByName.architecture.join(', ') : '',
                "screenshot": result.data.snapByName.screenshot_urls.filter(
                    url => !url.match(/\/banner(-icon)?_\w{7}.(png|jpg)$/)
                ),
                "installUrl" : `https://snapcraft.io/${result.data.snapByName.package_name}`,
                ...(result.data.snapByName.ratings_count > 0) && {
                    "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": result.data.snapByName.ratings_average,
                        "ratingCount": result.data.snapByName.ratings_count,
                        "bestRating": 5,
                        "worstRating": 0,
                        "name": "User rating",
                        "description": `Average uer-submitted rating for ${result.data.snapByName.title || result.data.snapByName.packageName}`,
                    },
                },
            })}
        </${'script'}>`}
    {/await}
</svelte:head>

{#await $data}
    <p>Loading...</p>
{:then result}
    <div class='snapinfo'>
        {#if result.data.snapByName.media.find(
            item => item.type === 'banner'
        )}
            <picture>
                <source
                    media="(min-width: 896px)"
                    srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_896/{result.data.snapByName.media.find(item => item.type === 'banner').url},
                        https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_1792/{result.data.snapByName.media.find(item => item.type === 'banner').url} 2x" />
                <source
                    media="(max-width: 720px)"
                    srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_720/{result.data.snapByName.media.find(item => item.type === 'banner').url},
                        https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_1440/{result.data.snapByName.media.find(item => item.type === 'banner').url} 2x" />
                <source
                    media="(max-width: 640px)"
                    srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_640/{result.data.snapByName.media.find(item => item.type === 'banner').url},
                        https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_1280/{result.data.snapByName.media.find(item => item.type === 'banner').url} 2x" />
                <source
                    media="(max-width: 480px)"
                    srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_480/{result.data.snapByName.media.find(item => item.type === 'banner').url},
                        https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_960/{result.data.snapByName.media.find(item => item.type === 'banner').url} 2x" />
                <img class='bannerImage' loading="lazy"
                    width="{result.data.snapByName.media.find(item => item.type === 'banner').width || 1920}"
                    height="{result.data.snapByName.media.find(item => item.type === 'banner').height || 640}"
                    src="https://res.cloudinary.com/canonical/image/fetch/{result.data.snapByName.media.find(item => item.type === 'banner').url}"
                    alt="{result.data.snapByName.title || result.data.snapByName.package_name} banner" />
            </picture>
        {/if}
        <div class='banner'>
            {#if result.data.snapByName.icon_url}
                <p class='icon'>
                    <picture>
                        <source
                            srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_128/{result.data.snapByName.icon_url},
                                https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_256/{result.data.snapByName.icon_url} 2x" />
                        <img height="128" width="128" loading="lazy"
                            src="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,w_128/{result.data.snapByName.icon_url}"
                            alt="Icon for {result.data.snapByName.title || result.data.snapByName.package_name}" />
                    </picture>
                </p>
            {/if}
            <h1 class='title'>{result.data.snapByName.title || result.data.snapByName.package_name}</h1>
            <p class='rating'><StarRating
                style={{
                    styleStarWidth: 25,
                    styleFullStarColor: '#ffd219',
                    styleEmptyStarColor: '#eeeeee',
                }}
                isIndicatorActive={false}
                rating={result.data.snapByName.ratings_average}
            /></p>
            <p class='version'>Version {result.data.snapByName.version}</p>
            <p class='summary'>{result.data.snapByName.summary}</p>
        </div>
        {#if
            // if any of these are present then display the meta box.
            result.data.snapByName.architecture ||
            result.data.snapByName.category ||
            result.data.snapByName.license ||
            result.data.snapByName.website ||
            result.data.snapByName.contact ||
            result.data.snapByName.publisher ||
            result.data.snapByName.developer_name ||
            result.data.snapByName.developer_validation ||
            result.data.snapByName.date_published ||
            result.data.snapByName.last_updated
        }
            <aside class='meta'>
                <dl>
                    {#if result.data.snapByName.architecture}
                        <dt>Architectures supported:</dt>
                        <dd>
                        {#if result.data.snapByName.architecture}
                            {result.data.snapByName.architecture.join(', ')}
                        {:else}
                            none
                        {/if}
                        </dd>
                    {/if}
                    {#if result.data.snapByName.sections}
                        <dt>Category:</dt>
                        <dd>{result.data.snapByName.sections.join(', ')}</dd>
                    {/if}
                    {#if result.data.snapByName.license}
                        <dt>License:</dt>
                        <dd>{result.data.snapByName.license}</dd>
                    {/if}
                    {#if result.data.snapByName.website}
                        <dt>Application website:</dt>
                        <dd><a href={result.data.snapByName.website}>{result.data.snapByName.website}</a></dd>
                    {/if}
                    {#if result.data.snapByName.contact}
                        <dt>Snap support contact:</dt>
                        <dd><a href={result.data.snapByName.contact}>{result.data.snapByName.contact}</a></dd>
                    {/if}
                    {#if result.data.snapByName.developer_name || result.data.snapByName.publisher}
                        <dt>Published to the Snap Store by:</dt>
                        <dd>
                            <a href="/publishers/{result.data.snapByName.developer_name || result.data.snapByName.publisher}">
                                {result.data.snapByName.developer_name || result.data.snapByName.publisher}
                            </a>
                            {#if result.data.snapByName.developer_validation === 'verified'}
                                <span class="verified">(Author is verified)</span>
                            {/if}
                        </dd>
                    {/if}
                    {#if result.data.snapByName.date_published}
                        <dt>Published on:</dt>
                        <dd>
                            <time dateTime={new Date(result.data.snapByName.date_published).toISOString()}>
                                {new Date(result.data.snapByName.date_published).toLocaleString()}
                            </time>
                        </dd>
                    {/if}
                    {#if result.data.snapByName.last_updated}
                        <dt>Last modified on:</dt>
                        <dd>
                            <time dateTime={new Date(result.data.snapByName.last_updated).toISOString()}>
                                {new Date(result.data.snapByName.last_updated).toLocaleString()}
                            </time>
                        </dd>
                    {/if}
                </dl>
            </aside>
        {/if}

        <DonateBtn />

        <h2>Description</h2>
        {@html DOMPurify.sanitize(marked(result.data.snapByName.description), DOMPurifyOpts)}

        {#if result.data.snapByName.media.filter(
            item => item.type === 'screenshot'
        ).length > 0 || (video && 'url' in video && 'type' in video)}
            <div class='screenshots-wrapper'>
                <h2>Screenshots</h2>
                <div class='screenshots'>
                    {#if video && 'url' in video && 'type' in video}
                        {#if video.type === 'youtube'}
                            <iframe id="ytplayer" type="text/html" width="818" height="460" title="Youtube player"
                                src="{video.url}?autoplay=1&mute=1&modestbranding=1&rel=0" frameborder="0" allowfullscreen></iframe>
                        {:else if video.type === 'vimeo'}
                            <iframe id="vimeoplayer" width="818" height="460" frameborder="0" title="Vimeo player"
                                src="{video.url}?title=0&byline=0&portrait=0&transparent=0" allowfullscreen></iframe>
                        {:else if video.type === 'asciinema'}
                            {@html `<${'script'} src="${video.url}" id="asciicast" async data-autoplay="1" data-preload="0"></${'script'}>`}
                        {/if}
                    {/if}
                    {#each result.data.snapByName.media.filter(item => item.type === 'screenshot') as screenshot}
                        <a data-fslightbox="screenshots" href="https://res.cloudinary.com/canonical/image/fetch/{screenshot.url}">
                            <picture>
                                <source srcset="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_240/{screenshot.url},
                                    https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_480/{screenshot.url} 2x,
                                    https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_720/{screenshot.url} 3x" />
                                <img loading="lazy" width={Math.ceil(screenshot.width * (240 / screenshot.height)) || 'auto'} height={240}
                                    src="https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_240/{screenshot.url}"
                                    alt="{result.data.snapByName.title || result.data.snapByName.package_name} screenshot" />
                            </picture>
                        </a>
                    {/each}
                </div>
            </div>
        {/if}

        <p class='storeButton'>
            <a href="https://snapcraft.io/{result.data.snapByName.package_name}">
                <img alt="Get it from the Snap Store"
                    src="https://snapcraft.io/static/images/badges/en/snap-store-black.svg" />
            </a>
        </p>
    </div>
{/await}

<a href="snaps">Search for another snap</a>, or{' '}
<a href="/">go back to the homepage</a>.
