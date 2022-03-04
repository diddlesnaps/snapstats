import fetch from "node-fetch";
import {spider} from "./config.js";
import SnapApi from "./api.js";
import {sort, getCounts, mapCounts, computeMean, computeMode, computeMedian} from "../statsHelpers.js";
import {SnapApiSnapResult, SnapApiSnap} from "./types";

export const getDetails = async (url: string): Promise<SnapApiSnapResult> => {
  const headers = {
    "User-Agent": spider.snaps.user_agent,
    "Snap-Device-Series": "16",
  };

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  return await res.json() as SnapApiSnapResult;
};

interface IArgs {
    snap: SnapApiSnap
    details_api_url: string
}

export const getStats = () => {
  return Promise.all(spider.snaps.stores.map(async (store) => {
    const api = new SnapApi(store);
    const snaps = (await api.list()).map((args: IArgs) => {
      const {snap, details_api_url} = args;
      return ({
        snap: {
          ...snap,
          base_snap: snap.base || "core",
        },
        details_api_url,
      });
    });

    const non_hello_or_test_snaps = snaps.map(({snap}) => snap)
        .filter((snap) => "package_name" in snap &&
                !snap.package_name.match(/^(hello|test)-/) &&
                !snap.package_name.match(/-test$/));

    console.debug("snapstore-api/index.js: Extracting counts");
    const section_counts = getCounts("sections.name", non_hello_or_test_snaps);
    const architecture_counts = getCounts("architecture", non_hello_or_test_snaps);
    const base_counts = getCounts("base_snap", non_hello_or_test_snaps);
    const confinement_counts = getCounts("confinement", non_hello_or_test_snaps);
    const channel_counts = getCounts("channel", non_hello_or_test_snaps.map((snap) => ({
      ...snap, channel: snap.channel.replace(/^.*\//, ""),
    })));
    const developer_counts = getCounts("developer_id", non_hello_or_test_snaps);
    const developer_averages = {
      mean: computeMean(developer_counts, non_hello_or_test_snaps.length),
      mode: computeMode(developer_counts),
      median: computeMedian(developer_counts),
    };

    let bases_total = 0;
    Object.keys(base_counts).forEach((key) => bases_total += base_counts[key]);

    console.debug("snapstore-api/index.js: Formatting count data");
    const sections = sort(Object.keys(section_counts) .map(mapCounts(section_counts)));
    const bases = sort(Object.keys(base_counts) .map(mapCounts(base_counts)));
    const architectures = sort(Object.keys(architecture_counts).map(mapCounts(architecture_counts)));
    const confinements = sort(Object.keys(confinement_counts) .map(mapCounts(confinement_counts)));
    const channels = sort(Object.keys(channel_counts) .map(mapCounts(channel_counts)));

    console.debug("snapstore-api/index.js: Returning complete results");
    return {
      snaps,
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
