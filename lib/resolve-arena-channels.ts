import fetch from "node-fetch";
import Arena from "are.na";

import { getEnv } from "./get-config-value";

import { log } from "./log";

const ARENA_USER = {
  slug: "korede-aderele",
  id: 60392,
  token: getEnv("ARENA_PERSONAL_ACCESS_TOKEN"),
};

export const all_channels: Record<number, Arena.Channel> = {};
export const keyword_to_channels: Record<string, number[]> = {};
function parseChannelKeywords(channels: Arena.Channel[]) {
  // log("DEBUG", "parseArenaChannels")
  for (const channel of channels) {
    // console.log(channel)
    all_channels[channel.id] = channel;
    // for (var block of channel.contents) {
    //   const title = block.title
    //   const desc = block.description
    //   const words = title.toLowerCase().split(" ").concat(
    //     desc.toLowerCase().split(" "))
    //   for (var word of words) {
    //     if (word in keyword_to_channels) {
    //       keyword_to_channels[word].push(channel.id)
    //     } else {
    //       keyword_to_channels[word] = [channel.id]
    //     }
    //   }
    // }
  }
}

// used to render
export async function resolveArenaChannels() {
  log("DEBUG", "resolveArenaChannels", ARENA_USER);
  try {
    const arenaUser = await requestArenaUserWithChannels(ARENA_USER.id, {
      accessToken: ARENA_USER.token,
    });
    parseChannelKeywords(arenaUser.channels);
    log("DEBUG", "Channel Keywords", {
      first: Object.values(all_channels)[0].contents,
      all_channels,
    }); // keyword_to_channels
    return arenaUser.channels;
  } catch (e) {
    log("ERROR", "resolveArenaChannels", e);
    return [];
  }
}

async function requestArenaUserWithChannels(
  userId: number,
  opts: { accessToken?: string; authToken?: string },
  params: { page?: string; per?: string } = {}
) {
  opts = opts || {};
  const headers = {
    "Content-Type": "application/json",
  };
  if (opts.accessToken) {
    headers["Authorization"] = `Bearer ${opts.accessToken}`;
  }
  if (opts.authToken) {
    headers["X-AUTH-TOKEN"] = `${opts.authToken}`;
  }
  const urlParams = new URLSearchParams(params);
  const response = await fetch(
    `https://api.are.na/v2/users/${userId}/channels?` + urlParams.toString(),
    {
      headers,
    }
  );
  return await response.json();
}
