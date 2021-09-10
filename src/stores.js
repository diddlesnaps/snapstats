import { writable } from 'svelte/store';

function createAnalyticsStore() {
    const {subscribe, set, update} = writable(false)
    return {
        subscribe,
        enable: () => set(true),
        disable: () => set(false),
        reset: () => set(false),
    };
}

function creatAdvertisingStore() {
    const {subscribe, set, update} = writable(false)
    return {
        subscribe,
        enable: () => set(true),
        disable: () => set(false),
        reset: () => set(false),
    };
}

export const analyticsEnabled = createAnalyticsStore();
export const advertisingEnabled = creatAdvertisingStore();