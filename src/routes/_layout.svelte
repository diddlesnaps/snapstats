<script>
	import Nav from '../components/Nav.svelte';

	export let segment;
</script>

<style>
	main {
		position: relative;
		max-width: 56em;
		background-color: white;
		padding: 2em;
		margin: 0 auto;
		box-sizing: border-box;
	}
	footer {
		display: flex;
		justify-content: center;
		padding: 2rem 0;
	}
</style>

<Nav {segment}/>

<main>
	<slot></slot>
</main>

<footer>
	<a href='privacy'>Privacy policy</a>
</footer>