<script>
    // @ts-check

    function logConversion(e) {
        globalThis.firebase?.analytics().logEvent('donate_banner_click');
    }
</script>

<style>
.donate img {
    vertical-align: middle;
}
</style>

<p class='donate'>
    Enjoying this site? Please <a href="https://liberapay.com/diddledan/donate" on:click={logConversion}><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"/></a> to help keep the Snapstats.org lights on.
</p>
