import Arena from "are.na"
import fetch from "node-fetch"

import * as acl from './acl'
import { pageUrlOverrides, pageUrlAdditions, environment, site } from './config'
import { db } from './db'
import { getEnv } from './get-config-value'

const ARENA_USER = {
  slug: 'korede-aderele',
  id: 60392,
  token: getEnv("ARENA_PERSONAL_ACCESS_TOKEN")
}

export async function resolveArenaChannels(domain: string, rawPageId?: string) {
  // TODO remove code for are.na client library
  // const arena = new Arena()
  // const arenaUser = arena.user(/* id */ ARENA_USER.id,)
  console.log("resolveArenaChannels", ARENA_USER)
  const arenaUser = await requestArenaUserWithChannels(ARENA_USER.id, {accessToken: ARENA_USER.token})
  return arenaUser.channels
}

async function requestArenaUserWithChannels(
  userId: number,
  opts: {accessToken?: string, authToken?: string},
  params: { page?: string, per?: string } = {}
) {
  opts = opts || {};
  let headers = {
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
