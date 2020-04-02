import { spider } from './config';
import { request } from 'gaxios';

const searchfields = [
    'aliases',
    'anon_download_url',
    'apps',
    'architecture',
    'base',
    'binary_filesize',
    'channel',
    'common_ids',
    'confinement',
    'date_published',
    'developer_id',
    'developer_name',
    'developer_validation',
    'download_url',
    'icon_url',
    'last_updated',
    'origin',
    'package_name',
    'ratings_average',
    'release',
    'revision',
    'screenshot_urls',
    'sections',
    'snap_id',
    'support_url',
    'version',
].join(',')

const detailsfields = [
    'contact',
    'description',
    'license',
    'media',
    'name',
    'prices',
    'private',
    'publisher',
    'snap_id',
    'store_url',
    'summary',
    'title',
    'trending',
    'unlisted',
    'website',
].join(',')

class SnapApi {
    constructor({url, details_url, domain}) {
        this.url = url;
        this.details_url = details_url;
        this.domain = domain;
    }

    async listArch(url, arch, section, previousResults) {
        let results = previousResults || [];

        const headers = {'User-Agent': spider.snaps.user_agent};
        if (arch) {
            headers['X-Ubuntu-Architecture'] = arch;
        }

        const res = await request({
            method: 'GET',
            url,
            headers,
        })

        // console.debug(`got package list page: ${url} (${arch}, ${section})`);

        if (res.data && res.data._embedded && res.data._embedded['clickindex:package']) {
            results = results.concat(res.data._embedded['clickindex:package'].map((snap) => {
                snap.section = section;
                return snap;
            }));
        }

        if (res.data._links && res.data._links.next && res.data._links.next.href) {
            let nextUrl = res.data._links.next.href;

            // Not sure why these links are coming back so weird, but this fixes it
            nextUrl = nextUrl.replace('http://snapdevicegw_cached', this.domain);
            nextUrl = nextUrl.replace('https://snapdevicegw_cached', this.domain);

            return this.listArch(nextUrl, arch, section, results);
        } else {
            return results;
        }
    }

    async searchList() {
        const url = `${this.url}/search?size=${spider.snaps.page_size}&confinement=strict,devmode,classic&scope=wide&fields=${searchfields}`;
        const promises = spider.snaps.architectures.map((architecture) => {
            return this.listArch(url, architecture);
        });
        promises.unshift(this.listArch(url));

        const results = await Promise.all(promises);
        const snapMap = {};
        let arch = 'all';
        let index = 0;
        for (const result of results) {
            // console.debug(`total packages (${arch}): ${snaps.length}`);
            for (const snap of result) {
                if (!snap.package_name) {
                    continue;
                }

                snap.architecture = (snap.architecture) ? snap.architecture : [arch];
                const name = snap.package_name;

                if (!snapMap[name]) {
                    snapMap[name] = snap;
                } else {
                    const oldSnap = snapMap[name];

                    let arches = snap.architecture.concat(snapMap[name].architecture || '');
                    arches = arches.filter((value, index_1, self) => {
                        return self.indexOf(value) === index_1;
                    });

                    if (arches.indexOf('all') > -1) {
                        arches = ['all'];
                    }

                    if (!oldSnap.revision || !snap.revision || snap.revision > oldSnap.revision) {
                        snapMap[name] = snap;
                    }

                    snapMap[name].architecture = arches;
                }
            }
            if (index < spider.snaps.architectures.length) {
                arch = spider.snaps.architectures[index];
                index++;
            }
        }

        for (const snapName of Object.keys(snapMap)) {
            try {
                snapMap[snapName] = {
                    ...snapMap[snapName],
                    ...await this.details(snap.packageName),
                }
            } catch (e) {
                console.error(`snapstore-api/api.js: Error fetching snap details for ${snapName}`, e)
            }
        }

        console.debug(`total packages: ${Object.keys(snapMap).length}`);
        return Object.values(snapMap);
    }

    async list() {
        const results = await Promise.all([
            this.searchList(),
            this.searchSectionList(),
        ]);
        const searchResults = results[0];
        const sectionResults = results[1];
        searchResults.forEach((searchResult) => {
            searchResult.categories = sectionResults.filter((sectionResult) => {
                return (sectionResult.package_name === searchResult.package_name);
            }).map((sectionResult) => {
                return sectionResult.section;
            });
        });
        console.debug('snapstore-api/api.js: : Returning package results')
        return searchResults;
    }

    async detailsArch(url, arch, series) {
        const headers = {
            'User-Agent': spider.snaps.user_agent,
            'Snap-Device-Series': series,
        };

        if (arch && arch !== 'all') {
            headers['X-Ubuntu-Architecture'] = arch;
        }

        const res = await request({
            method: 'GET',
            url,
            headers,
        });
        
        return res.data;
    }

    async details(packageName, arches, section, series) {
        console.debug('snapstore-api/api.js: : getting details for ' + packageName);

        const url = `${this.details_url}/details/${packageName}?fields=${fields}`;
        // const promises = arches.map(async (arch) => {
        //     try {
        //         return this.detailsArch(url, arch, series);
        //     } catch (e) {
        //         // console.error(`Failed getting details of snap "${packageName}:${arch}"`);
        //         return null;
        //     }
        // });
        // const results = await Promise.all(promises);

        const results = await this.detailsArch(url, 'all', 16)

        let snap = {};
        const downloads = {};
        results.forEach((result) => {
            if (result) {
                if (!snap || (result.revision && snap.revision && result.revision > snap.revision)) {
                    snap = result;
                }
                if (result.anon_download_url && result.architecture) {
                    downloads[result.architecture[0]] = result.anon_download_url;
                }
            }
        });
        if (snap !== {}) {
            snap.downloads = downloads;
            snap.architecture = arches;
            snap.section = section;
            return snap;
        }
        return null;
    }

    async sections() {
        const url = `${this.url}/sections`;
        const headers = {
            'User-Agent': spider.snaps.user_agent,
        };

        const res = await request({
            method: 'GET',
            url,
            headers,
        });

        return res.data._embedded['clickindex:sections'];
    }

    async searchSectionList() {
        const sections = await this.sections();
        const sectionResults = await Promise.all(sections.map((section) => {
            return this.listArch(`${this.url}/search?size=${spider.snaps.page_size}&confinement=strict,devmode,classic&section=${section.name}&scope=wide&fields=${searchfields}`, undefined, section.name, []);
        }));
        let results = [];
        sectionResults.forEach((sectionResult) => {
            results = results.concat(sectionResult);
        });
        return results;
    }
}

export default SnapApi;