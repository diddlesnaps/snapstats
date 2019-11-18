<script>
    import {onMount} from 'svelte';

	export let segment;

    let share_enabled;
    
    onMount(async () => {
        share_enabled = !!navigator.share;
	});
	
	function showNotice(message) {
		let notice = document.createElement('div');
		notice.innerText = message;
		notice.style.position = 'absolute';
		notice.style.top = '56px';
		notice.style.left = '50%';
		notice.style.width = '500px';
		notice.style.marginLeft = '-250px';
		notice.style.backgroundColor = '#cfe';
		notice.style.padding = '1.5rem';
		notice.style.fontSize = '1.6rem';
		notice.style.zIndex = 2;
		document.body.prepend(notice);
		notice.focus();

		window.setTimeout(() => {
			document.body.removeChild(notice);
		}, 20000);
	}

    function share(e) {
		e.preventDefault();
		let title = document.title || 'Snap store statistics';
		let text = document.head.querySelector('meta[name="description"]').content || 'Check it out on snapstats';
		let url = document.URL;
        if (navigator.share) {
            navigator.share({
                title,
                text,
                url,
            })
            .then(() => console.log('Successful share'))
            .catch((error) => {
				showNotice('An error occurred while trying to share this page...');
				console.log('Error sharing', error);
			});
        } else {
			navigator.clipboard.writeText(`${title}: ${text} (${url})`)
			.then(() => {
				showNotice(`The URL for this page has been copied to your device's Clipboard. Use the 'paste' feature of your device to share it with a friend or another app.`);
				console.log('Successful copy to clipboard');
			})
			.catch((error) => {
				showNotice('An error occurred while trying to share this page...');
				console.log('Error copying to clipboard', error);
			});
		}
    }
</script>

<style>
	nav {
		font-weight: 300;
		padding: 0 1em;
		background: #333333;
		color: #ffffff;
	}

	ul {
		margin: 0;
		padding: 0;
		display: flex;
		gap: 0.4rem;
	}

	li {
		display: inline-block;
		height: 56px;
	}

	.selected {
		position: relative;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: rgb(255,62,0);
		display: block;
		bottom: 0;
	}

	a {
		text-decoration: none;
		padding: 0.5em;
		display: flex;
		align-items: center;
		height: 100%;
		box-sizing: border-box;
	}
	a:focus {
		border: 2px solid red;
	}

	input.sharebtn {
		font-size: 1rem;
		line-height: 1.5rem;
		padding: 0;
		margin: 0;
		border: 0;
		display: block;
		cursor: pointer;
		font-weight: 300;
		color: transparent;
		background: url('/share.svg') transparent center center no-repeat;
		width: 56px;
		height: 56px;
	}
	input.sharebtn:focus {
		border: 2px solid red;
	}

	img.logo {
		height: 1.7em;
		margin-bottom: -0.6em;
	}

</style>

<nav aria-label="Navigation menu">
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
        <li style='{share_enabled ? 'display: initial' : 'display: none'}'><input class="sharebtn" type="button" on:click={share} value="share this page"/></li>
	</ul>
</nav>
