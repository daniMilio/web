import { Client } from "typesense";
import { generateMutation } from "~/graphql/graphqlGen";
import { players_update_column, players_constraint } from "~/generated/zeus";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";

const client = new Client({
  nodes: [
    {
      host: process.env.NUXT_PUBLIC_TYPESENSE_HOST as string,
      port: 443,
      protocol: "https",
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY as string,
  connectionTimeoutSeconds: 2,
});

const httpLink = createHttpLink({
  uri: `https://${process.env.NUXT_PUBLIC_API_DOMAIN}/v1/graphql`,
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  let query = body.query?.trim();

  let queryBy = "name,steam_id";

  let exclude = "";
  if (body.exclude && Array.isArray(body.exclude)) {
    body.exclude.forEach((steamId: string) => {
      exclude += (exclude ? " && " : "") + `steam_id:!=${steamId}`;
    });
  }

  const results = await client
    .collections("players")
    .documents()
    .search({
      q: query ?? "*",
      query_by: queryBy,
      sort_by: "name:asc",
      infix: ["fallback", "off"],
      ...(body.exclude ? { filter_by: exclude } : {}),
      ...(body.teamId ? { filter_by: `teams:${body.teamId}` } : {}),
      ...(body.page ? { page: body.page } : {}),
      ...(body.per_page ? { per_page: body.per_page } : {}),
    });

  if (process.env.STEAM_API_KEY && !body.teamId && results.found === 0) {
    try {
      const steamData = query.match(/^[0-9]+$/)
        ? await searchBySteamId(query)
        : await searchByAcountName(query);

      if (steamData.response?.players?.length > 0) {
        const players = steamData.response.players as {
          steamid: string;
          avatar: string;
          personaname: string;
          profileurl: string;
          loccountrycode: string;
        }[];

        await apolloClient.mutate({
          mutation: generateMutation({
            insert_players: [
              {
                objects: players.map((player) => ({
                  name: player.personaname,
                  steam_id: player.steamid,
                  avatar_url: player.avatar,
                  profile_url: player.profileurl,
                  country: player.loccountrycode,
                })),
                on_conflict: {
                  update_columns: [players_update_column.name],
                  constraint: players_constraint.players_steam_id_key,
                },
              },
              {
                affected_rows: true,
              },
            ],
          }),
        });

        return {
          found: players.length,
          hits: players.map((player) => ({
            document: {
              name: player.personaname,
              steam_id: player.steamid,
              avatar_url: player.avatar,
              profile_url: player.profileurl,
              country: player.loccountrycode,
            },
          })),
        };
      }
    } catch (error) {
      console.error("Error fetching Steam API:", error);
    }
  }

  return results;
});

async function searchBySteamId(steamId: string) {
  const steamResponse = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steamId}`,
  );
  return await steamResponse.json();
}

async function searchByAcountName(accountName: string) {
  const steamResponse = await fetch(
    `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${process.env.STEAM_API_KEY}&vanityurl=${accountName}`,
  );

  if (steamResponse.status !== 200) {
    return {
      response: {
        players: [],
      },
    };
  }

  const {
    response: { steamid: steamId },
  } = await steamResponse.json();

  return searchBySteamId(steamId);
}
