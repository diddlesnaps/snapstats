/* eslint-disable camelcase */
import fetch from "node-fetch";

import {spider} from "./config.js";
import {
  SnapApiData,
  SnapApiSectionsData,
  SnapApiSnap,
} from "./types";

const searchfields = [
  "aliases",
  "anon_download_url",
  "apps",
  "architecture",
  "base",
  "binary_filesize",
  "channel",
  "common_ids",
  "confinement",
  "date_published",
  "developer_id",
  "developer_name",
  "developer_validation",
  "download_url",
  "icon_url",
  "last_updated",
  "license",
  "origin",
  "package_name",
  "ratings_average",
  "release",
  "revision",
  "screenshot_urls",
  "sections",
  "snap_id",
  "support_url",
  "version",
].join(",");

const detailsfields = [
  "contact",
  "description",
  "license",
  "media",
  "name",
  "prices",
  "private",
  "publisher",
  "snap-yaml",
  "summary",
  "title",
  "trending",
  "unlisted",
  "website",
].join(",");

class SnapApi {
  url: string;
  details_url: string;
  domain: string;

  constructor(props: {url: string; details_url: string; domain: string;}) {
    this.url = props.url;
    this.details_url = props.details_url;
    this.domain = props.domain;
  }

  async listArch(
      url: string,
      arch: string | null,
      section: string | null,
      previousResults: SnapApiSnap[] | null
  ): Promise<SnapApiSnap[]> {
    let results: SnapApiSnap[] = previousResults ?? [];

    const headers: HeadersInit = {"User-Agent": spider.snaps.user_agent};
    if (arch) {
      headers["X-Ubuntu-Architecture"] = arch;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    const data = await res.json() as SnapApiData;
    if (data?._embedded?.["clickindex:package"]) {
      results = results.concat(data._embedded["clickindex:package"]);
    }

    if (data?._links?.next?.href) {
      let nextUrl = data._links.next.href;

      // Not sure why these links are coming back so weird, but this fixes it
      nextUrl = nextUrl.replace("http://snapdevicegw_cached", this.domain);
      nextUrl = nextUrl.replace("https://snapdevicegw_cached", this.domain);

      return this.listArch(nextUrl, arch, section, results);
    } else {
      return results;
    }
  }

  async searchList(): Promise<{
    snap: SnapApiSnap, details_api_url: string
  }[]> {
    const url =
        `${this.url}/search?size=${spider.snaps.page_size}&` +
        "confinement=strict,devmode,classic&" +
        "scope=wide&" +
        `fields=${searchfields}&` +
        `cachebuster=${Math.random()}`;
    const promises: {arch: string, snaps: Promise<SnapApiSnap[]>}[] =
        spider.snaps.architectures.map((architecture) => ({
          arch: architecture,
          snaps: this.listArch(url, architecture, null, null),
        }));
    promises.unshift({
      arch: "all",
      snaps: this.listArch(url, null, null, null),
    });

    // eslint-disable-next-line camelcase
    const snapMap: Map<string, {snap: SnapApiSnap; details_api_url: string;}> =
        new Map();
    for (const {arch, snaps} of promises) {
      const results = await snaps;
      console.debug(`total packages (${arch}): ${results.length}`);
      for (const snap of results) {
        if (!snap.package_name) {
          console.debug("No packge_name, skipping");
          continue;
        }

        snap.architecture ??= [arch];
        const name = snap.package_name;

        // eslint-disable-next-line camelcase
        const details_api_url =
            `${this.details_url}/${name}?fields=${detailsfields}`;
        if (!snapMap.has(name)) {
          snapMap.set(name, {
            snap,
            details_api_url,
          });
        } else {
          const oldSnap = snapMap.get(name).snap;

          let arches = snap.architecture.concat(oldSnap.architecture ?? []);
          arches = [...new Set(arches)];

          if (arches.includes("all")) {
            arches = ["all"];
          }

          let newSnap = oldSnap;
          if (snap.revision > oldSnap.revision) {
            newSnap = snap;
          }

          newSnap.architecture = arches;

          snapMap.set(name, {
            snap: newSnap,
            details_api_url,
          });
        }
      }
    }

    console.debug(`total packages: ${snapMap.size}`);
    return [...snapMap.values()];
  }

  async list(): Promise<{snap: SnapApiSnap, details_api_url: string}[]> {
    const results = await this.searchList();
    console.debug("snapstore-api/api.js: : Returning package results");
    return results;
  }

  async detailsArch(url: string, arch: string | null, series: string | null):
      Promise<SnapApiSectionsData> {
    const headers: HeadersInit = {
      "User-Agent": spider.snaps.user_agent,
      "Snap-Device-Series": series ?? "16",
    };

    if (arch && arch !== "all") {
      headers["X-Ubuntu-Architecture"] = arch;
    }

    const res = await fetch(url, {
      method: "GET",
      headers,
    });

    return await res.json();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async details(packageName: string, _arches: string[],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _section: string, _series: string): Promise<SnapApiSectionsData> {
    const url = `${this.details_url}/${packageName}?fields=${detailsfields}`;

    return await this.detailsArch(url, "all", "16");
  }
}

export default SnapApi;
