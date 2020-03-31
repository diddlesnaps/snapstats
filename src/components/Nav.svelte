<script>
    import {onMount} from 'svelte';

	export let segment;

    let share_enabled;
    
    onMount(async () => {
        share_enabled = !!navigator.share;
	});
	
	function showNotice(message, isError = false) {
		return function(error = null) {
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

			if (isError) {
				console.log('Error sharing', error);
			}
		}
	}

	function logShare(url) {
		return function() {
			firebase.analytics().logEvent('share', {
				'content_type': 'page',
				'item_id': url,
			});
		};
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
            .then(logShare(url))
            .catch(showNotice('An error occurred while trying to share this page...', true));
        } else {
			navigator.clipboard.writeText(`${title}: ${text} (${url})`)
			.then(logShare(url))
			.then(showNotice(`The URL for this page has been copied to your device's Clipboard. Use the 'paste' feature of your device to share it with a friend or another app.`, false))
			.catch(showNotice('An error occurred while trying to share this page...', true));
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
		flex-direction: row;
		flex-wrap: wrap;
	}

	li {
		display: block;
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
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath d='M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z' fill='%23fff'/%3E%3C/svg%3E") transparent center center no-repeat;
		width: 56px;
		height: 56px;
	}
	input.sharebtn:focus {
		border: 2px solid red;
	}

	.selected {
		position: relative;
	}

	.selected::after {
		position: absolute;
		content: '';
		width: calc(100% - 1em);
		height: 2px;
		background-color: #ff3e00;
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
		outline-offset: -2px;
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
		<li><a class='{segment === 'about' ? 'selected' : ''}' href='about'>about</a></li>
		<li><a class='{segment === 'snaps' ? 'selected' : ''}' href='snaps'>snaps</a></li>
		<li><a class='{segment === 'developers' ? 'selected' : ''}' href='developers'>developers</a></li>
		<li><a class='{segment === 'bases' ? 'selected' : ''}' href='bases'>bases</a></li>
		<li><a class='{segment === 'channels' ? 'selected' : ''}' href='channels'>channels</a></li>
		<li><a class='{segment === 'confinements' ? 'selected' : ''}' href='confinements'>confinements</a></li>
		<li><a class='{segment === 'licenses' ? 'selected' : ''}' href='licenses'>licenses</a></li>
        <li style='{share_enabled ? 'display: initial' : 'display: none'}'><input class="sharebtn" type="button" on:click={share} value="share this page"/></li>
	</ul>
</nav>
