<script>
    import SnapPane from './SnapPane.svelte';

    export let snaps
</script>

<style>
.snaps {
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-wrap: wrap;
}

.snaps li {
    width: 100%;
    margin: 0 1em;
}

@media (min-width: 640px) {
    .snaps li {
        width: calc(50% - 2em);
    }
}
</style>

<div>
    {#if snaps}
    <ul class='snaps'>
        {#each snaps as snap}
            <li>
                <SnapPane {snap}/>
            </li>
        {/each}
    </ul>
    {:else}
    <p>Nothing found...</p>
    {/if}
</div>