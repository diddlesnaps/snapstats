<script>
    export let snap;

    let icon_url;
    
    $: icon_url = `https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_92/${snap.icon_url}`;
    $: icon2x_url = `https://res.cloudinary.com/canonical/image/fetch/q_auto,f_auto,h_184/${snap.icon_url}`;
</script>

<style>
.grid {
    display: grid;
    margin: 1em 0;
    gap: 0.4em 1em;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
        "icon"
        "title"
        "summary";
}
@media only screen and (min-width: 280px) {
    .grid {
        grid-template-columns: 92px 1fr;
        grid-template-areas:
            "icon title"
            "icon summary";
    }
}

.icon {
    width: 92px;
    height: 92px;
    grid-area: icon;
}

.title {
    grid-area: title;
    margin: 0;
}

.summary {
    grid-area: summary;
    margin: 0;
}
</style>

<div class='grid'>
    {#if snap.icon_url}
        <picture class='icon'>
            <source srcset={`${icon2x_url} 2x, ${icon_url} 1x`} />
            <img width="92" height="92" src={icon_url} alt={`Icon of ${snap.title}`} loading="lazy" />
        </picture>
    {/if}
    <p class='title'>
        <a href={`snaps/${snap.package_name}`}>
            {snap.title}
        </a>
    </p>
    <p class='summary'>{snap.summary}</p>
</div>
