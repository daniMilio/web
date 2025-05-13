import { ref, watch, computed } from "vue";
import { defineStore, acceptHMRUpdate } from "pinia";
import { e_match_types_enum, $, e_lobby_access_enum } from "~/generated/zeus";
import getGraphqlClient from "~/graphql/getGraphqlClient";
import { generateQuery, generateSubscription } from "~/graphql/graphqlGen";
import { playerFields } from "~/graphql/playerFields";
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { webrtc } from "~/web-sockets/Webrtc";

const REGION_LATENCY_PREFIX = "5stack_region_latency_";
const MAX_LATENCY_KEY = "5stack_max_acceptable_latency";
const PREFERRED_REGIONS_KEY = "5stack_preferred_regions";

export const useMatchmakingStore = defineStore("matchmaking", () => {
  const playersOnline = ref([]);
  const onlinePlayerSteamIds = ref<string[]>([]);

  const joinedMatchmakingQueues = ref<{
    details?: {
      totalInQueue: number;
      type: e_match_types_enum;
      regions: Array<string>;
    };
    confirmation?: {
      matchId: string;
      isReady: boolean;
      expiresAt: string;
      confirmed: number;
      confirmationId: string;
      type: e_match_types_enum;
      region: string;
    };
  }>({
    details: undefined,
    confirmation: undefined,
  });

  const regionStats = ref<
    Partial<Record<string, Partial<Record<e_match_types_enum, number>>>>
  >({});

  const queryPlayers = async () => {
    const steamIds = onlinePlayerSteamIds.value;
    if (steamIds.length === 0) {
      return;
    }
    const { data } = await getGraphqlClient().query({
      query: generateQuery({
        players: [
          {
            where: {
              steam_id: {
                _in: $("steam_ids", "[bigint]!"),
              },
            },
          },
          playerFields,
        ],
      }),
      variables: {
        steam_ids: steamIds,
      },
    });

    playersOnline.value = data.players;
  };

  const friends = ref([]);
  const subscribeToFriends = async (mySteamId: bigint) => {
    const subscription = getGraphqlClient().subscribe({
      query: generateSubscription({
        my_friends: [
          {},
          {
            elo: true,
            name: true,
            role: true,
            country: true,
            steam_id: true,
            avatar_url: true,
            status: true,
            invited_by_steam_id: true,
            player: {
              lobby_players: [
                {
                  limit: 1,
                  where: {
                    lobby: {
                      _not: {
                        players: {
                          steam_id: {
                            _eq: $("mySteamId", "bigint!"),
                          },
                        },
                      },
                      access: {
                        _in: [
                          e_lobby_access_enum.Friends,
                          e_lobby_access_enum.Open,
                        ],
                      },
                    },
                  },
                },
                {
                  lobby_id: true,
                  lobby: {
                    id: true,
                    players: [
                      {},
                      {
                        player: {
                          name: true,
                          country: true,
                          steam_id: true,
                          avatar_url: true,
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      }),
      variables: {
        mySteamId,
      },
    });

    subscription.subscribe({
      next: ({ data }) => {
        friends.value = data.my_friends;
      },
    });
  };

  watch(
    () => useAuthStore().me,
    (me) => {
      if (me) {
        subscribeToFriends(me.steam_id);
      }
    },
    { immediate: true },
  );

  watch(onlinePlayerSteamIds, (newSteamIds, oldSteamIds) => {
    if (
      newSteamIds.length !== oldSteamIds.length ||
      !newSteamIds.every((id, index) => id === oldSteamIds[index])
    ) {
      queryPlayers();
    }
  });

  const inviteToLobby = async (steam_id: string) => {
    const me = useAuthStore().me;

    let lobby_id = me?.current_lobby_id;

    if (!lobby_id) {
      const { data } = await getGraphqlClient().mutate({
        mutation: typedGql("mutation")({
          insert_lobbies_one: [
            {
              object: {},
            },
            {
              id: true,
            },
          ],
        }),
      });
      lobby_id = data.insert_lobbies_one.id;
    }

    await getGraphqlClient().mutate({
      mutation: typedGql("mutation")({
        insert_lobby_players_one: [
          {
            object: {
              steam_id,
              lobby_id,
            },
          },
          {
            __typename: true,
          },
        ],
      }),
    });
  };

  const localStoragePreferredRegions = localStorage.getItem(
    PREFERRED_REGIONS_KEY,
  );

  const storedRegions = ref<string[]>(
    localStoragePreferredRegions
      ? JSON.parse(localStoragePreferredRegions)
      : [],
  );

  const latencies = ref(new Map<string, number[]>());

  // Load existing latencies from localStorage for each region
  useApplicationSettingsStore().availableRegions.forEach((region) => {
    const savedLatency = localStorage.getItem(
      REGION_LATENCY_PREFIX + region.value,
    );
    if (savedLatency) {
      latencies.value.set(region.value, JSON.parse(savedLatency));
    }
  });

  const savedMaxLatency = localStorage.getItem(MAX_LATENCY_KEY);
  const playerMaxAcceptableLatency = ref(
    savedMaxLatency ? parseInt(savedMaxLatency) : 75,
  );

  const isRefreshing = ref(false);
  async function refreshLatencies() {
    isRefreshing.value = true;
    resetLatencies();
    await Promise.all(
      useApplicationSettingsStore().availableRegions.map((region) =>
        getLatency(region.value),
      ),
    );
    isRefreshing.value = false;
  }

  function checkLatenies() {
    if (latencies.value.size === 0) {
      refreshLatencies();
    }
  }

  async function getLatency(region: string) {
    try {
      const buffer = new Uint8Array([0x01]).buffer;

      const datachannel = await webrtc.connect(region, (data) => {
        if (data === "") {
          datachannel.send(buffer);
          return;
        }

        const event = JSON.parse(data) as {
          type: string;
          data: Record<string, unknown>;
        };

        if (event.type === "latency-results") {
          datachannel.close();
          latencies.value.set(region, event.data);
        }
      });

      datachannel.send("latency-test");
    } catch (error) {
      console.error(`Failed to get latency for ${region}`, error);
    }
  }

  function togglePreferredRegion(region: string) {
    const index = storedRegions.value.indexOf(region);
    if (index !== -1) {
      storedRegions.value.splice(index, 1);
    } else {
      storedRegions.value.push(region);
    }
    localStorage.setItem(
      PREFERRED_REGIONS_KEY,
      JSON.stringify(storedRegions.value.filter(Boolean)),
    );
  }

  function updateMaxAcceptableLatency(latency: number) {
    playerMaxAcceptableLatency.value = latency;
    localStorage.setItem(MAX_LATENCY_KEY, latency.toString());
  }

  function resetLatencies() {
    latencies.value.clear();
    useApplicationSettingsStore().availableRegions.forEach((region) => {
      localStorage.removeItem(REGION_LATENCY_PREFIX + region.value);
    });
  }

  function getRegionlatencyResult(region: string):
    | {
        isLan: boolean;
        latency: string;
      }
    | undefined {
    const regionLatencies = latencies.value.get(region);
    if (!regionLatencies) {
      return;
    }
    return {
      isLan: regionLatencies.isLan,
      latency: Number(regionLatencies.latency).toFixed(2),
    };
  }

  const preferredRegions = computed(() => {
    const availableRegions =
      useApplicationSettingsStore().availableRegions.filter((region) => {
        const regionLatency = getRegionlatencyResult(region.value);

        if (regionLatency && region.is_lan && regionLatency.isLan) {
          return true;
        }

        if (
          regionLatency &&
          regionLatency.latency >
            (useApplicationSettingsStore().maxAcceptableLatency || 100)
        ) {
          return false;
        }

        return true;
      });

    if (isRefreshing.value) {
      return availableRegions;
    }

    if (storedRegions.value.length > 0) {
      return availableRegions.filter((region) => {
        return storedRegions.value.includes(region.value);
      });
    }

    return availableRegions
      .filter((region) => {
        const regionResult = getRegionlatencyResult(region.value);

        if (!regionResult) {
          return true;
        }

        return (
          !isNaN(Number(regionResult.latency)) &&
          Number(regionResult.latency) <= playerMaxAcceptableLatency.value
        );
      })
      .sort((a, b) => {
        if (a.is_lan && !b.is_lan) {
          return -1;
        }
        if (!a.is_lan && b.is_lan) {
          return 1;
        }

        // For non-LAN regions, sort by latency
        return (
          Number(getRegionlatencyResult(a.value)?.latency) -
          Number(getRegionlatencyResult(b.value)?.latency)
        );
      });
  });

  return {
    friends,
    regionStats,
    playersOnline,
    onlinePlayerSteamIds,
    joinedMatchmakingQueues,

    checkLatenies,
    refreshLatencies,
    getRegionlatencyResult,
    togglePreferredRegion,
    updateMaxAcceptableLatency,

    latencies,
    storedRegions,
    preferredRegions,
    playerMaxAcceptableLatency,

    inviteToLobby,
  };
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useMatchmakingStore, import.meta.hot));
}
