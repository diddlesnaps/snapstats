import crypto from "crypto";

export const spider = {
  snaps: {
    rate_limit: 100,
    page_size: 1000,
    user_agent: `https://snapstats.org/ spider: run by Dani Llewellyn: https://launchpad.net/~diddledani (${crypto.randomUUID()})`,
    stores: [
      {
        name: "Ubuntu Store",
        id: "ubuntu",
        url: "https://api.snapcraft.io/api/v1/snaps",
        details_url: "https://api.snapcraft.io/v2/snaps/info",
        domain: "https://api.snapcraft.io",
      },
    ],
  },
};
