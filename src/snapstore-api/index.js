import { request } from 'gaxios';
import { spider } from './config';
import SnapApi from './api';
function sort(array) {
    return array.sort((a, b) => b.count - a.count);
}

export const getDetails = async (url) => {
    const headers = {
        'User-Agent': spider.snaps.user_agent,
        'Snap-Device-Series': '16',
    };

    const res = await request({
        method: 'GET',
        url,
        headers,
    });
    
    return res.data;
}

export const getStats = () => {
    return Promise.all(spider.snaps.stores.map(async (store) => {
        const api = new SnapApi(store);
        const snaps = (await api.list()).map(({snap}) => ({
            ...snap,
            base_snap: snap.base || 'core',
        }));;

        const non_hello_or_test_snaps = snaps.filter(({snap}) =>
            'package_name' in snap && !snap.package_name.match(/^(hello|test)-/) && !snap.package_name.match(/-test$/))

        console.debug('snapstore-api/index.js: Extracting counts')
        const license_counts      = extractCombinedLicenseCounts(getCounts('license', non_hello_or_test_snaps));
        const section_counts      = getCounts('sections.name', non_hello_or_test_snaps)
        const architecture_counts = getCounts('architecture', non_hello_or_test_snaps);
        const base_counts         = getCounts('base_snap', non_hello_or_test_snaps);
        const confinement_counts  = getCounts('confinement', non_hello_or_test_snaps);
        const channel_counts      = getCounts('channel', non_hello_or_test_snaps);
        const developer_counts    = getCounts('developer_id', non_hello_or_test_snaps);
        const developer_averages = {
            mean: computeMean(developer_counts, non_hello_or_test_snaps.length),
            mode: computeMode(developer_counts),
            median: computeMedian(developer_counts),
        };
        
        let bases_total = 0;
        Object.keys(base_counts).forEach((key) => bases_total += base_counts[key]);

        const mapCounts = (cnts) => (key) => ({name: key, count: cnts[key]});

        console.debug('snapstore-api/index.js: Formatting count data')
        const licenses      = sort(Object.keys(license_counts)     .map(mapCounts(license_counts)));
        const sections      = sort(Object.keys(section_counts)     .map(mapCounts(section_counts)))
        const bases         = sort(Object.keys(base_counts)        .map(mapCounts(base_counts)));
        const architectures = sort(Object.keys(architecture_counts).map(mapCounts(architecture_counts)));
        const confinements  = sort(Object.keys(confinement_counts) .map(mapCounts(confinement_counts)));
        const channels      = sort(Object.keys(channel_counts)     .map(mapCounts(channel_counts)));

        console.debug('snapstore-api/index.js: Returning complete results')
        return {
            snaps,
            licenses,
            sections,
            architectures,
            bases,
            channels,
            confinements,
            developer_counts: {
                total: Object.keys(developer_counts).length,
                ...developer_averages,
            },
            snap_counts: {
                total: snaps.length,
                filtered: non_hello_or_test_snaps.length,
            },
        };
    }));
};

const extractCombinedLicenseCounts = (cnts) => {
    const matchRegex = /\s+(?:AND|OR)\s+/g;
    const replaceRegex = /\(|\)/g;
    for (const key of Object.keys(cnts)) {
        const itemCount = cnts[key];
        if (key.match(matchRegex)) {
            delete(cnts[key]);
            const licenses = key.split(matchRegex);
            for (let license of licenses) {
                license = license.replace(replaceRegex, '');
                if (!cnts.hasOwnProperty(license)) {
                    cnts[license] = 0;
                }
                cnts[license] += itemCount;
            }
        }
    }
    return cnts;
}

const getCounts = (field, json) => {
    const [parentField, childField] = field.split('.', 2)
    const items = json.reduce((carry, snap) => {
        let newCarry = carry || [];
        if (parentField in snap) {
            let item = snap[parentField];
            if (!Array.isArray(item)) {
                item = [item];
            }
            newCarry = [...newCarry, ...item];
        }
        return newCarry;
    }, []);

    const item_names = [...new Set(items.map(item => childField ? item[childField] : item))];

    const item_counts = {};
    for (const name of item_names) {
        const this_item = items.reduce((carry, item) => {
            let newCarry = carry || [];
            if (item === name) {
                newCarry = [...newCarry, true];
            }
            return newCarry;
        }, []);

        item_counts[name] = this_item.length;
    }

    return item_counts;
};

const computeMean = (items, count) => {
    const length = Object.keys(items).length;
    if (length < 1) {
        return 0.0;
    }
    const unbounded = count / length;
    return Number.parseFloat(unbounded.toPrecision(4));
}
const computeMode = (items) => {
    const buckets = {};
    let highestFrequency = 0;
    let mode = 0;

    for (const key of Object.keys(items)) {
        const count = items[key];
        buckets[count] = (buckets[count] || 0) + 1;
        if (highestFrequency < buckets[count]) {
            highestFrequency = buckets[count];
            mode = count;
        }
    };
    return mode;
}
const computeMedian = (items) => {
    let values = [];
    for (const key of Object.keys(items)) {
        values.push(items[key]);
    }
    values = values.sort((a, b) => a - b);
    const middle = Math.floor((values.length - 1) / 2);
    if (values.length % 2) {
        return values[middle];
    } else {
        return (values[middle] + values[middle + 1]) / 2.0;
    }
}