<script>
    function logConversion(e) {
        firebase.analytics().logEvent('donate_banner_click');
    }
</script>

<style>
.donate img {
    vertical-align: middle;
}
</style>

<p class='donate'>
    Please <a href="https://liberapay.com/diddledan/donate" on:click={logConversion}><img alt="Donate using Liberapay" src="https://liberapay.com/assets/widgets/donate.svg"/></a> to help keep the lights on.
</p>