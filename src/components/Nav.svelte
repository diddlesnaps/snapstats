<script>
    import {onMount} from 'svelte';

	export let segment;

    let share_enabled;
    
    onMount(async () => {
        share_enabled = !!navigator.share;
    });

    function share() {
        if (navigator.share) {
            navigator.share({
                title: document.title || 'Snap store statistics',
                text: document.head.querySelector('meta[name="description"]').content || 'Check it out on snapstats',
                url: document.URL,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => console.log('Error sharing', error));
        } else {
            
        }
    }
</script>

<style>
	nav {
		border-bottom: 1px solid rgba(255,62,0,0.1);
		font-weight: 300;
		padding: 0 1em;
		background: #333333;
		color: #ffffff;
	}

	ul {
		margin: 0;
		padding: 0;
	}

	/* clearfix */
	ul::after {
		content: '';
		display: block;
		clear: both;
	}

	li {
		display: block;
		float: left;
	}

	.selected {
		position: relative;
		display: inline-block;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: -1px;
	}

	a {
		text-decoration: none;
		padding: 1em 0.5em;
		display: block;
	}

	img.logo {
		height: 1.7em;
		margin-bottom: -0.6em;
	}

</style>

<nav>
	<ul>
		<li>
			<a class='{segment === undefined ? "selected" : ""}' href='.'>
				<picture>
					<source srcset="snapstats@2x.png 2x,
									snapstats.png 1x" />
					<img class='logo' src='snapstats.png' alt='snapstats' />
				</picture>
			</a>
		</li>
		<li><a class='{segment === 'snaps' ? 'selected' : ''}' href='snaps'>snaps</a></li>
		<li><a class='{segment === 'bases' ? 'selected' : ''}' href='bases'>bases</a></li>
		<li><a class='{segment === 'channels' ? 'selected' : ''}' href='channels'>channels</a></li>
		<li><a class='{segment === 'confinements' ? 'selected' : ''}' href='confinements'>confinements</a></li>
		<li><a class='{segment === 'licenses' ? 'selected' : ''}' href='licenses'>licenses</a></li>
        <li style='{share_enabled ? 'display: initial' : 'display: none'}'><a on:click={share}>share this page</a></li>
	</ul>
</nav>
