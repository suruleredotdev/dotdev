import fetch from "node-fetch"

import { getEnv } from './get-config-value'

const ARENA_USER = {
  slug: 'korede-aderele',
  id: 60392,
  token: getEnv("ARENA_PERSONAL_ACCESS_TOKEN")
}

// used to render
export async function resolveArenaChannels() {
  console.log("resolveArenaChannels", ARENA_USER)
  try {
    const arenaUser = await requestArenaUserWithChannels(ARENA_USER.id, {accessToken: ARENA_USER.token})
    return arenaUser.channels
  } catch (e) {
    console.log("ERROR resolveArenaChannels", e)
    return []
  }
}

async function requestArenaUserWithChannels(
  userId: number,
  opts: {accessToken?: string, authToken?: string},
  params: { page?: string, per?: string } = {}
) {
  opts = opts || {};
  const headers = {
    "Content-Type": "application/json"
  };
  if (opts.accessToken) {
    headers["Authorization"] = `Bearer ${opts.accessToken}`;
  }
  if (opts.authToken) {
    headers["X-AUTH-TOKEN"] = `${opts.authToken}`;
  }
  const urlParams = new URLSearchParams(params)
  const response = await fetch(`https://api.are.na/v2/users/${userId}/channels?`+urlParams.toString(), {
    headers
  });
  return await response.json()
}
