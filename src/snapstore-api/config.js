export const spider = {
    search_api: 'https://search.apps.ubuntu.com/api/v1/search',
    snap_search_api: 'https://search.apps.ubuntu.com/api/v1/snaps/search',
    reviews_api: 'https://reviews.ubuntu.com/click/api/1.0/reviews/',
    departments_api: 'https://search.apps.ubuntu.com/api/v1/departments',
    packages_api: 'https://search.apps.ubuntu.com/api/v1/package/',
    snap_packages_api: 'https://search.apps.ubuntu.com/api/v1/snaps/details/',
    //How many packages to pull in a page
    page_size: 500,
    //Which architectures to pull from the store
    architectures: ['i386', 'amd64', 'armhf'],
    user_agent: 'uappexplorer.com',

    snaps: {
        rate_limit: 100,
        page_size: 1000,
        architectures: ['i386', 'amd64', 'armhf', 'arm64', 'ppc64el', 's390x'],
        user_agent: 'https://snapstats.org/ spider: run by Daniel Llewellyn: https://launchpad.net/~diddledan',
        stores: [
            {
                name: 'Ubuntu Store',
                id: 'ubuntu',
                url: 'https://search.apps.ubuntu.com/api/v1/snaps',
                domain: 'https://search.apps.ubuntu.com',
            }
        ],
    }
};