<script lang="ts" setup>
import MatchesTable from "~/components/MatchesTable.vue";
import Pagination from "~/components/Pagination.vue";
import PageHeading from "~/components/PageHeading.vue";
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import { ChevronDownIcon } from "lucide-vue-next";
import { e_player_roles_enum } from "~/generated/zeus";
import LastTenWins from "~/components/charts/LastTenWins.vue";
import LastTenLosses from "~/components/charts/LastTenLosses.vue";
import formatStatValue from "~/utilities/formatStatValue";
import SanctionPlayer from "~/components/SanctionPlayer.vue";
import PlayerSanctions from "~/components/PlayerSanctions.vue";
import PlayerChangeName from "~/components/PlayerChangeName.vue";
import SteamIcon from "~/components/icons/SteamIcon.vue";
import { Button } from "~/components/ui/button";
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { generateMutation } from "~/graphql/graphqlGen";
</script>

<template>
  <PlayerSanctions class="my-4" :playerId="$route.params.id as string" />

  <div class="flex-grow flex flex-col gap-4" v-if="player">
    <PageHeading>
      <template #title>
        <div class="flex items-center justify-center gap-4">
          <div class="flex flex-col gap-2">
            <PlayerChangeName :player="player" />
            <div class="flex items-center gap-4">
              <PlayerDisplay
                :player="player"
                size="xl"
                :show-steam-id="true"
                v-if="player"
              />
              <a
                v-if="player?.profile_url"
                :href="player.profile_url"
                target="_blank"
                class="flex items-center justify-center p-2 rounded-md border border-border bg-background hover:bg-accent/50 transition-colors"
                title="View Steam Profile"
              >
                <SteamIcon class="size-5 fill-foreground" />
              </a>
            </div>
          </div>
        </div>
      </template>

      <template #actions>
        <div class="flex flex-col gap-2">
          <div class="flex gap-2 items-center">
            <template v-if="player.steam_id !== me.steam_id && !isUser">
              <SanctionPlayer :player="player" />
            </template>

            <template v-if="isAdmin && player.steam_id !== me.steam_id">
              <Popover>
                <PopoverTrigger as-child>
                  <Button variant="outline">
                    <span class="capitalize">{{
                      player.role.replace("_", " ")
                    }}</span>
                    <ChevronDownIcon class="ml-2 h-4 w-4 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="p-0" align="end">
                  <Command v-model="memberRole">
                    <CommandList>
                      <CommandGroup>
                        <CommandItem
                          :value="role.value"
                          class="flex flex-col items-start px-4 py-2 cursor-pointer"
                          v-for="role of roles"
                        >
                          <span class="capitalize">{{ role.display }}</span>
                        </CommandItem>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </template>

            <template v-if="player.steam_id !== me.steam_id">
              <template v-if="isFriend && friendStatus === 'Accepted'">
                <Button variant="destructive" class="ml-auto" @click="removeFriend">
                  {{ $t('matchmaking.friends.remove') }}
                </Button>
              </template>
            </template>
          </div>
        </div>
      </template>
    </PageHeading>

    <div
      class="grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-4"
      v-if="player"
    >
      <Card class="flex flex-col h-full">
        <CardHeader>
          <CardTitle class="text-sm font-medium text-muted-foreground">{{
            $t("pages.players.detail.player_stats")
          }}</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col flex-grow">
          <div class="flex justify-between items-center">
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                {{ $t("pages.players.detail.kills") }}
              </p>
              <p class="text-2xl font-bold">
                {{ player.kills_aggregate.aggregate.count }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                {{ $t("pages.players.detail.assists") }}
              </p>
              <p class="text-2xl font-bold">
                {{ player.assists_aggregate.aggregate.count }}
              </p>
            </div>
            <div class="text-center">
              <p class="text-sm text-muted-foreground">
                {{ $t("pages.players.detail.deaths") }}
              </p>
              <p class="text-2xl font-bold">
                {{ player.deaths_aggregate.aggregate.count }}
              </p>
            </div>
          </div>

          <div class="flex justify-center items-center mt-4 h-full">
            <Badge class="text-3xl p-2">
              {{ $t("pages.players.detail.kd") }}: {{ kd }}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="flex justify-center items-center">
        <div class="text-center">
          <CardHeader>
            <CardTitle class="text-xl font-bold text-center">
              {{ $t("pages.players.detail.last_ten_wins") }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LastTenWins :steam_id="$route.params.id as string" />
          </CardContent>
        </div>
      </Card>

      <Card class="flex justify-center items-center">
        <div class="text-center">
          <CardHeader>
            <CardTitle class="text-xl font-bold text-center">
              {{ $t("pages.players.detail.last_ten_losses") }}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LastTenLosses :steam_id="$route.params.id as string" />
          </CardContent>
        </div>
      </Card>
    </div>

    <Separator />

    <Card class="p-4">
      <CardHeader>
        <CardTitle class="text-xl font-bold">
          {{ $t("pages.players.detail.matches") }}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <matches-table
          :matches="playerWithMatches?.matches"
          v-if="playerWithMatches?.matches"
        ></matches-table>
      </CardContent>
    </Card>

    <Pagination
      :page="page"
      :per-page="perPage"
      @page="
        (_page) => {
          page = _page;
        }
      "
      :total="playerWithMatchesAggregate.total_matches"
      v-if="playerWithMatchesAggregate"
    ></Pagination>
  </div>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { $, order_by } from "~/generated/zeus";
import { generateQuery } from "~/graphql/graphqlGen";
import { simpleMatchFields } from "~/graphql/simpleMatchFields";
import { generateMutation } from "~/graphql/graphqlGen";
import { playerFields } from "~/graphql/playerFields";

export default {
  apollo: {
    $subscribe: {
      players_by_pk: {
        query: typedGql("subscription")({
          players_by_pk: [
            {
              steam_id: $("playerId", "bigint!"),
            },
            {
              ...playerFields,
              role: true,
              profile_url: true,
              kills_aggregate: [
                {
                  where: {
                    team_kill: {
                      _eq: false,
                    },
                  },
                },
                {
                  aggregate: [
                    {},
                    {
                      count: true,
                    },
                  ],
                },
              ],
              deaths_aggregate: [
                {},
                {
                  aggregate: [
                    {},
                    {
                      count: true,
                    },
                  ],
                },
              ],
              assists_aggregate: [
                {
                  where: {
                    is_team_assist: {
                      _eq: false,
                    },
                  },
                },
                {
                  aggregate: [
                    {},
                    {
                      count: true,
                    },
                  ],
                },
              ],
            },
          ],
        }),
        variables: function () {
          return {
            playerId: this.$route.params.id,
          };
        },
        result: function ({ data }) {
          this.player = data.players_by_pk;
        },
      },
    },
    playerWithMatches: {
      fetchPolicy: "network-only",
      query: generateQuery({
        __alias: {
          playerWithMatches: {
            players_by_pk: [
              {
                steam_id: $("playerId", "bigint!"),
              },
              {
                matches: [
                  {
                    limit: $("limit", "Int!"),
                    offset: $("offset", "Int!"),
                    order_by: [
                      {},
                      {
                        created_at: order_by.desc,
                      },
                    ],
                  },
                  simpleMatchFields,
                ],
              },
            ],
          },
        },
      }),
      variables: function () {
        return {
          playerId: this.$route.params.id,
          limit: this.perPage,
          offset: (this.page - 1) * this.perPage,
        };
      },
    },
    playerWithMatchesAggregate: {
      fetchPolicy: "network-only",
      query: generateQuery({
        __alias: {
          playerWithMatchesAggregate: {
            players_by_pk: [
              {
                steam_id: $("playerId", "bigint!"),
              },
              {
                total_matches: true,
              },
            ],
          },
        },
      }),
      variables: function () {
        return {
          playerId: this.$route.params.id,
        };
      },
    },
  },
  data() {
    return {
      player: undefined,
      page: 1,
      perPage: 10,
      memberRole: undefined,
      roles: [
        { value: e_player_roles_enum.user, display: "User" },
        { value: e_player_roles_enum.verified_user, display: "Verified User" },
        { value: e_player_roles_enum.streamer, display: "Streamer" },
        {
          value: e_player_roles_enum.match_organizer,
          display: "Match Organizer",
        },
        {
          value: e_player_roles_enum.tournament_organizer,
          display: "Tournament Organizer",
        },
        { value: e_player_roles_enum.administrator, display: "Administrator" },
      ],
    };
  },
  watch: {
    memberRole: {
      handler(role) {
        if (role) {
          this.updateRole();
          return;
        }
      },
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    isAdmin() {
      return useAuthStore().isAdmin;
    },
    isUser() {
      return useAuthStore().isUser;
    },
    isFriend() {
      return useMatchmakingStore().friends.some(friend => friend.steam_id === this.player?.steam_id);
    },
    friendStatus() {
      const friend = useMatchmakingStore().friends.find(friend => friend.steam_id === this.player?.steam_id);
      return friend?.status;
    },
    kd() {
      if (this.player?.deaths_aggregate.aggregate.count === 0) {
        return this.player?.kills_aggregate.aggregate.count;
      }
      return formatStatValue(
        this.player?.kills_aggregate.aggregate.count /
          this.player?.deaths_aggregate.aggregate.count,
      );
    },
  },
  methods: {
    async updateRole() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          update_players_by_pk: [
            {
              _set: {
                role: this.memberRole,
              },
              pk_columns: {
                steam_id: this.player.steam_id,
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async removeFriend() {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          delete_my_friends: [
            {
              where: {
                steam_id: {
                  _eq: this.player.steam_id,
                },
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
  },
};
</script>
