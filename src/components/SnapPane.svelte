<script type="ts">
    import StarRating from './StarRating.svelte'

    export let snap: {
        title: string;
        summary: string;
        package_name: string;
        icon_url: string;
        ratings_average: number;
    };

    let icon_url: string?;
    let icon2x_url: string?;
    let icon3x_url: string?;
    
    $: icon_url = `https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_92/${snap.icon_url}`;
    $: icon2x_url = `https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_184/${snap.icon_url}`;
    $: icon3x_url = `https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_276/${snap.icon_url}`;
</script>

<style>
.grid {
    display: grid;
    margin: 1em 0;
    gap: 0.4em 1em;
    grid-template-columns: 92px 1fr;
    grid-template-rows: auto auto;
    grid-template-areas:
        "icon title"
        "icon rating"
        "icon summary";
}

.icon {
    grid-area: icon;
}
.icon img {
    width: 92px;
    height: 92px;
}

.title {
    grid-area: title;
    margin: 0;
}

.rating {
    grid-area: rating;
    margin: 0;
}

.summary {
    grid-area: summary;
    margin: 0;
}
</style>

{#if snap}
    <div class='grid'>
        {#if snap.icon_url}
            <a class='icon' href={`snaps/${snap.package_name}`}>
                <picture>
                    <source srcset={`${icon3x_url} 3x, ${icon2x_url} 2x, ${icon_url} 1x`} />
                    <img width="92" height="92" src={icon_url} alt={`Icon of ${snap.title}`} loading="lazy" />
                </picture>
            </a>
        {/if}
        <p class='title'>
            <a href={`snaps/${snap.package_name}`}>
                {snap.title}
            </a>
        </p>
        <div class='rating'><StarRating
            style={{
                styleStarWidth: 16,
                styleFullStarColor: '#ffd219',
                styleEmptyStarColor: '#eeeeee',
            }}
            isIndicatorActive={false}
            rating={snap.ratings_average}
        /></div>
        <p class='summary'>{snap.summary}</p>
    </div>
{/if}
