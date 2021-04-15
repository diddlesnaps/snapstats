// @ts-check

/** @type {(array: {name: string, count: number}[]) => {name: string, count: number}[]} */
export function sort(array) {
    return array.sort((a, b) => b.count - a.count);
}

/** @type {(cnts: {[key: string]: number}) => {[key: string]: number}} */
export const extractCombinedLicenseCounts = (cnts) => {
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

/** @type {(field: string, json: any) => {[key: string]: number}} */
export const getCounts = (field, json) => {
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

    /** @type {{[key: string]: number}} */
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

/** @type {(cnts: {[key: string]: number}) => (key: string) => {name: string, count: number}} */
export const mapCounts = (cnts) => (key) => ({name: key, count: cnts[key]});

/** @type {(items: any, count: number) => number} */
export const computeMean = (items, count) => {
    const length = Object.keys(items).length;
    if (length < 1) {
        return 0.0;
    }
    const unbounded = count / length;
    return Number.parseFloat(unbounded.toPrecision(4));
}

/** @type {(items: any) => number} */
export const computeMode = (items) => {
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

/** @type {(items: any) => number} */
export const computeMedian = (items) => {
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