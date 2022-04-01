import fetch from "node-fetch";

import {spider} from "./config.js";
import {SnapApiData, SnapApiResults, SnapApiSectionsData, SnapApiSnap} from "./types";

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

    constructor(props: { url: string; details_url: string; domain: string; }) {
      this.url = props.url;
      this.details_url = props.details_url;
      this.domain = props.domain;
    }

    async listArch(url: string, arch: string | null, section: string | null, previousResults: SnapApiSnap[] | null): Promise<SnapApiSnap[]> {
      let results: SnapApiSnap[] = previousResults || [];

      const headers: HeadersInit = {"User-Agent": spider.snaps.user_agent};
      if (arch) {
        headers["X-Ubuntu-Architecture"] = arch;
      }

      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      const data = await res.json() as SnapApiData;

      // console.debug(`got package list page: ${url} (${arch}, ${section})`);

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

    async searchList(): Promise<{snap: SnapApiSnap, details_api_url: string}[]> {
      const url = `${this.url}/search?size=${spider.snaps.page_size}&confinement=strict,devmode,classic&scope=wide&fields=${searchfields}`;
      const promises: Promise<SnapApiSnap[]>[] = spider.snaps.architectures.map((architecture) => this.listArch(url, architecture, null, null));
      promises.unshift(this.listArch(url, null, null, null));

      const results = await Promise.all(promises);
      const snapMap: { [key: string]: { snap: SnapApiSnap; details_api_url: string; }; } = {};
      let arch = "all";
      let index = 0;
      for (const result of results) {
        // console.debug(`total packages (${arch}): ${snaps.length}`);
        for (const snap of result) {
          if (!snap.package_name) {
            continue;
          }

          snap.architecture = (snap.architecture) ? snap.architecture : [arch];
          const name = snap.package_name;

          const details_api_url = `${this.details_url}/${name}?fields=${detailsfields}`;
          if (!snapMap[name]) {
            snapMap[name] = {
              snap,
              details_api_url,
            };
          } else {
            const oldSnap = snapMap[name].snap;

            let arches = snap.architecture.concat(oldSnap.architecture ?? []);
            arches = arches.filter((value, index_1, self) => {
              return self.indexOf(value) === index_1;
            });

            if (arches.indexOf("all") > -1) {
              arches = ["all"];
            }

            if (!oldSnap.revision || !snap.revision || snap.revision > oldSnap.revision) {
              snapMap[name].snap = snap;
            }

            snapMap[name].snap.architecture = arches;
            snapMap[name].details_api_url = `${this.details_url}/${name}?fields=${detailsfields}`;
          }
        }
        if (index < spider.snaps.architectures.length) {
          arch = spider.snaps.architectures[index];
          index++;
        }
      }

      console.debug(`total packages: ${Object.keys(snapMap).length}`);
      return Object.values(snapMap);
    }

    async list() {
      const results = await this.searchList();
      console.debug("snapstore-api/api.js: : Returning package results");
      return results;
    }

    async detailsArch(url: string, arch: string | null, series: string | null) {
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

    async details(packageName: string, arches: string[], section: string, series: string) {
      // console.debug('snapstore-api/api.js: : getting details for ' + packageName);

      const url = `${this.details_url}/${packageName}?fields=${detailsfields}`;

      return await this.detailsArch(url, "all", "16");
    }

    async sections() {
      const url = `${this.url}/sections`;
      const headers: HeadersInit = {
        "User-Agent": spider.snaps.user_agent,
      };

      const res = await fetch(url, {
        method: "GET",
        headers,
      });

      const data = await res.json() as SnapApiSectionsData;

      return data._embedded["clickindex:sections"];
    }

    async searchSectionList() {
      const sections = await this.sections();
      const sectionResults = await Promise.all(sections.map((section) => {
        return this.listArch(`${this.url}/search?size=${spider.snaps.page_size}&confinement=strict,devmode,classic&section=${section.name}&scope=wide&fields=${searchfields}`, null, section.name, []);
      }));
      const results: SnapApiResults[] = [];
      return results.concat(sectionResults.map((sectionResult) => ({snap: sectionResult})));
    }
}

export default SnapApi;