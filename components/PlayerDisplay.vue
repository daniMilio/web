<script lang="ts" setup>
import TimezoneFlag from "~/components/TimezoneFlag.vue";
import { Ban, MicOff, MessageSquareOff, UserPlus } from "lucide-vue-next";
import PlayerElo from "~/components/PlayerElo.vue";
import { Crown, Shield, BadgeCheck, BadgeIcon, Podcast } from "lucide-vue-next";
import FiveStackToolTip from "./FiveStackToolTip.vue";
</script>

<template>
  <TooltipProvider v-if="friendlistMode && showTooltip">
    <Tooltip>
      <NuxtLink
        :to="
          linkable && player?.steam_id
            ? { name: 'players-id', params: { id: player?.steam_id } }
            : undefined
        "
        class="flex items-center gap-2 p-2 rounded-l-lg hover:bg-accent transition-colors"
        :class="{
          'cursor-pointer': linkable,
        }"
      >
        <TooltipTrigger class="flex flex-col items-center justify-center relative">
          <slot name="avatar">
            <Avatar shape="square" class="h-8 w-8">
              <AvatarImage
                :src="player?.avatar_url"
                :alt="player?.name"
                v-if="player?.avatar_url"
              />
              <AvatarFallback>
                <slot name="avatar-fallback">
                  {{ player?.name?.slice(0, 2) }}
                </slot>
              </AvatarFallback>
            </Avatar>
          </slot>
          <slot name="status">
            <template v-if="isOnline && showOnline">
              <span
                class="absolute -top-1 left-0 h-2 w-2 rounded-full animate-ping bg-green-500"
                v-if="pingStatus"
              ></span>
              <span
                class="absolute -top-1 left-0 h-2 w-2 rounded-full bg-green-500"
              ></span>
            </template>
          </slot>
        </TooltipTrigger>
        <div class="flex flex-col">
          <div class="flex items-center gap-2">
            <div>{{ player?.name }}</div>
            <FiveStackToolTip v-if="showRole">
              <template #trigger>
                <template v-if="isUser">
                  <BadgeIcon class="w-3 h-3" />
                </template>
                <template v-if="isVerified">
                  <BadgeCheck class="w-3 h-3 text-green-500" />
                </template>
                <template v-if="isStreamer">
                  <Podcast class="w-3 h-3 text-green-500" />
                </template>
                <template v-if="isOrganizer">
                  <Shield class="w-3 h-3 text-yellow-500" />
                </template>
                <template v-if="isTournamentOrganizer">
                  <Shield class="w-3 h-3 text-orange-500" />
                </template>
                <template v-if="isAdmin">
                  <Crown class="w-3 h-3 text-red-500" />
                </template>
              </template>
              <span class="capitalize">
                {{ player?.role?.replace("_", " ") }}
              </span>
            </FiveStackToolTip>
          </div>
        </div>
      </NuxtLink>
      <TooltipContent 
        class="p-4 bg-accent" 
        :side="'bottom'"
        :align="'center'"
        :sideOffset="5"
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <Avatar shape="square" class="h-12 w-12">
              <AvatarImage
                :src="player?.avatar_url"
                :alt="player?.name"
                v-if="player?.avatar_url"
              />
              <AvatarFallback>
                {{ player?.name?.slice(0, 2) }}
              </AvatarFallback>
            </Avatar>
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <TimezoneFlag
                  class="mt-1"
                  v-if="tooltipShowFlag"
                  :country="player?.country"
                />
                <div class="font-medium text-foreground">{{ player?.name }}</div>
              </div>
              <div class="flex items-center gap-2">
                <FiveStackToolTip v-if="tooltipShowRole">
                  <template #trigger>
                    <template v-if="isUser">
                      <BadgeIcon class="w-3 h-3 mr-1" />
                    </template>
                    <template v-if="isVerified">
                      <BadgeCheck class="w-3 h-3 mr-1 text-green-500" />
                    </template>
                    <template v-if="isStreamer">
                      <Podcast class="w-3 h-3 mr-1 text-green-500" />
                    </template>
                    <template v-if="isOrganizer">
                      <Shield class="w-3 h-3 mr-1 text-yellow-500" />
                    </template>
                    <template v-if="isTournamentOrganizer">
                      <Shield class="w-3 h-3 mr-1 text-orange-500" />
                    </template>
                    <template v-if="isAdmin">
                      <Crown class="w-3 h-3 mr-1 text-red-500" />
                    </template>
                  </template>
                  <span class="capitalize">
                    {{ player?.role?.replace("_", " ") }}
                  </span>
                </FiveStackToolTip>
                <PlayerElo :elo="player?.elo" v-if="tooltipShowElo" />
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2 mt-2 pt-2 border-t">
            <div class="grid grid-cols-3 gap-4 w-full">
              <template v-if="tooltipShowKills">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium text-green-500">{{ kills }}</span>
                  <span class="text-xs text-muted-foreground">Kills</span>
                </div>
              </template>
              <template v-if="tooltipShowDeaths">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium text-red-500">{{ deaths }}</span>
                  <span class="text-xs text-muted-foreground">Deaths</span>
                </div>
              </template>
              <template v-if="tooltipShowAssists">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium text-blue-500">{{ assists }}</span>
                  <span class="text-xs text-muted-foreground">Assists</span>
                </div>
              </template>
              <template v-if="tooltipShowKD">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium" :class="{
                    'text-green-500': Number(kdRatio) >= 1,
                    'text-yellow-500': Number(kdRatio) < 1 && Number(kdRatio) >= 0.5,
                    'text-red-500': Number(kdRatio) < 0.5
                  }">{{ kdRatio }}</span>
                  <span class="text-xs text-muted-foreground">K/D Ratio</span>
                </div>
              </template>
              <template v-if="tooltipShowHS">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium text-purple-500">{{ headshotPercentage }}%</span>
                  <span class="text-xs text-muted-foreground">HS%</span>
                </div>
              </template>
              <template v-if="tooltipShowWinRate">
                <div class="flex flex-col items-center">
                  <span class="text-sm font-medium text-orange-500">{{ winRate }}%</span>
                  <span class="text-xs text-muted-foreground">Win Rate</span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
  <NuxtLink
    v-else
    :to="
      linkable && player?.steam_id
        ? { name: 'players-id', params: { id: player?.steam_id } }
        : undefined
    "
    class="grid gap-2"
    :class="{
      'cursor-pointer': linkable,
      'grid-cols-[52px_1fr]':
        !friendlistMode && (showName || showSteamId || showRole || showFlag),
      'grid-cols-[32px_1fr]':
        !friendlistMode && size === 'xs' && (showName || showSteamId || showRole || showFlag),
    }"
  >
    <div class="flex flex-col items-center justify-center relative">
      <slot name="avatar">
        <Avatar shape="square" :class="{ 'h-8 w-8': size === 'xs' }">
          <AvatarImage
            :src="player?.avatar_url"
            :alt="player?.name"
            v-if="player?.avatar_url"
          />
          <AvatarFallback>
            <slot name="avatar-fallback">
              {{ player?.name?.slice(0, 2) }}
            </slot>
          </AvatarFallback>
        </Avatar>
      </slot>
      <slot name="status">
        <template v-if="isOnline && showOnline">
          <span
            class="absolute -top-1 left-0 h-2 w-2 rounded-full animate-ping bg-green-500"
            v-if="pingStatus"
          ></span>
          <span
            class="absolute -top-1 left-0 h-2 w-2 rounded-full bg-green-500"
          ></span>
        </template>
      </slot>
      <div class="mt-2" v-if="$slots['avatar-sub']">
        <slot name="avatar-sub"></slot>
      </div>
    </div>
    <div
      :class="{
        'flex items-center':
          !player?.steam_id ||
          (!showSteamId && !showRole) ||
          (!showName && !showFlag),
      }"
      v-if="showFlag || showName || showSteamId || showRole"
    >
      <slot>
        <div
          class="text-left"
          :class="{
            'text-xs': size === 'xs',
            'text-sm': size === 'sm',
            'text-lg': size === 'lg',
            'text-xl': size === 'xl',
          }"
        >
          <div class="flex items-center gap-2">
            <slot name="name-prefix"></slot>
            <div class="flex items-center gap-2">
              <TimezoneFlag
                class="mt-1"
                v-if="showFlag"
                :country="player?.country"
              />
              <div v-if="showName">{{ player?.name }}</div>
              <div class="flex gap-2">
                <TooltipProvider v-if="player?.is_banned">
                  <Tooltip>
                    <TooltipTrigger>
                      <Ban
                        class="w-4 h-4 text-red-500"
                        v-if="player?.is_banned"
                      />
                    </TooltipTrigger>
                    <TooltipContent>{{
                      $t("player.status.banned")
                    }}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <template v-else>
                  <TooltipProvider v-if="player?.is_muted">
                    <Tooltip>
                      <TooltipTrigger>
                        <MicOff
                          class="w-4 h-4 text-red-500"
                          v-if="player?.is_muted"
                        />
                      </TooltipTrigger>
                      <TooltipContent>{{
                        $t("player.status.muted")
                      }}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <TooltipProvider v-if="player?.is_gagged">
                    <Tooltip>
                      <TooltipTrigger>
                        <MessageSquareOff
                          class="w-4 h-4 text-red-500"
                          v-if="player?.is_gagged"
                        />
                      </TooltipTrigger>
                      <TooltipContent>{{
                        $t("player.status.gagged")
                      }}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </template>
              </div>
            </div>
            <slot name="name-postfix"></slot>
            <TooltipProvider
              v-if="!isMe && showAddFriend && !isFriend && player?.steam_id"
            >
              <Tooltip>
                <TooltipTrigger>
                  <UserPlus
                    class="w-4 h-4 cursor-pointer hover:text-primary"
                    @click.stop="addAsFriend"
                  />
                </TooltipTrigger>
                <TooltipContent>{{
                  $t("player.status.add_friend")
                }}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div class="flex items-center gap-2" v-if="player?.steam_id">
            <FiveStackToolTip v-if="showRole">
              <template #trigger>
                <template v-if="isUser">
                  <BadgeIcon class="w-3 h-3 mr-1" />
                </template>
                <template v-if="isVerified">
                  <BadgeCheck class="w-3 h-3 mr-1 text-green-500" />
                </template>
                <template v-if="isStreamer">
                  <Podcast class="w-3 h-3 mr-1 text-green-500" />
                </template>
                <template v-if="isOrganizer">
                  <Shield class="w-3 h-3 mr-1 text-yellow-500" />
                </template>
                <template v-if="isTournamentOrganizer">
                  <Shield class="w-3 h-3 mr-1 text-orange-500" />
                </template>
                <template v-if="isAdmin">
                  <Crown class="w-3 h-3 mr-1 text-red-500" />
                </template>
              </template>
              <span class="capitalize">
                {{ player?.role?.replace("_", " ") }}
              </span>
            </FiveStackToolTip>
            <PlayerElo :elo="player?.elo" v-if="showElo" />
            <p class="text-muted-foreground text-xs" v-if="showSteamId">
              {{ player?.steam_id }}
            </p>
          </div>
        </div>
      </slot>
    </div>
    <slot name="footer"></slot>
  </NuxtLink>
</template>

<script lang="ts">
import { e_player_roles_enum } from "~/generated/zeus";
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { $ } from "~/generated/zeus";
import { generateQuery } from "~/graphql/graphqlGen";

export default {
  apollo: {
    playerStats: {
      query: generateQuery({
        __alias: {
          playerStats: {
            players_by_pk: [
              {
                steam_id: $("steamId", "bigint!"),
              },
              {
                kills_aggregate: [
                  {
                    where: {
                      team_kill: {
                        _eq: false,
                      },
                    },
                  },
                  {
                    aggregate: {
                      count: true,
                    },
                  },
                ],
                headshot_kills_aggregate: [
                  {
                    where: {
                      team_kill: {
                        _eq: false,
                      },
                      headshot: {
                        _eq: true,
                      },
                    },
                  },
                  {
                    aggregate: {
                      count: true,
                    },
                  },
                ],
                deaths_aggregate: [
                  {},
                  {
                    aggregate: {
                      count: true,
                    },
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
                    aggregate: {
                      count: true,
                    },
                  },
                ],
                map_wins: {
                  aggregate: {
                    count: true,
                  },
                },
                map_losses: {
                  aggregate: {
                    count: true,
                  },
                },
              },
            ],
          },
        },
      }),
      variables() {
        return {
          steamId: this.player?.steam_id,
        };
      },
      skip() {
        return !this.player?.steam_id;
      },
    },
  },
  props: {
    size: {
      type: String,
      default: "sm",
    },
    player: {
      type: Object,
      required: false,
    },
    showName: {
      type: Boolean,
      default: true,
    },
    showFlag: {
      type: Boolean,
      default: true,
    },
    showRole: {
      type: Boolean,
      default: true,
    },
    showSteamId: {
      type: Boolean,
      default: false,
    },
    linkable: {
      type: Boolean,
      default: false,
    },
    showOnline: {
      type: Boolean,
      default: true,
    },
    pingStatus: {
      type: Boolean,
      default: false,
    },
    showAddFriend: {
      type: Boolean,
      default: true,
    },
    showElo: {
      type: Boolean,
      default: true,
    },
    friendlistMode: {
      type: Boolean,
      default: false,
    },
    showTooltip: {
      type: Boolean,
      default: false,
    },
    tooltipShowFlag: {
      type: Boolean,
      default: true,
    },
    tooltipShowRole: {
      type: Boolean,
      default: true,
    },
    tooltipShowElo: {
      type: Boolean,
      default: true,
    },
    tooltipShowKills: {
      type: Boolean,
      default: false,
    },
    tooltipShowDeaths: {
      type: Boolean,
      default: false,
    },
    tooltipShowAssists: {
      type: Boolean,
      default: false,
    },
    tooltipShowKD: {
      type: Boolean,
      default: true,
    },
    tooltipShowHS: {
      type: Boolean,
      default: true,
    },
    tooltipShowWinRate: {
      type: Boolean,
      default: true,
    },
  },
  methods: {
    async addAsFriend() {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          insert_my_friends_one: [
            {
              object: {
                steam_id: this.player.steam_id,
              },
            },
            {
              steam_id: true,
            },
          ],
        }),
      });
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    isMe() {
      if (!this.player) {
        return false;
      }

      return this.me?.steam_id === this.player.steam_id;
    },
    isOnline() {
      if (!this.player) {
        return false;
      }

      return useMatchmakingStore().onlinePlayerSteamIds.includes(
        this.player.steam_id,
      );
    },
    isFriend() {
      if (!this.player) {
        return false;
      }

      return useMatchmakingStore().friends.find((friend) => {
        return friend.steam_id == this.player.steam_id;
      });
    },
    isUser() {
      return this.player?.role === e_player_roles_enum.user;
    },
    isVerified() {
      return this.player?.role === e_player_roles_enum.verified_user;
    },
    isStreamer() {
      return this.player?.role === e_player_roles_enum.streamer;
    },
    isOrganizer() {
      return this.player?.role === e_player_roles_enum.match_organizer;
    },
    isTournamentOrganizer() {
      return this.player?.role === e_player_roles_enum.tournament_organizer;
    },
    isAdmin() {
      return this.player?.role === e_player_roles_enum.administrator;
    },
    kills() {
      return this.playerStats?.kills_aggregate?.aggregate?.count || 0;
    },
    deaths() {
      return this.playerStats?.deaths_aggregate?.aggregate?.count || 0;
    },
    assists() {
      return this.playerStats?.assists_aggregate?.aggregate?.count || 0;
    },
    kdRatio() {
      if (!this.deaths) return this.kills;
      return (this.kills / this.deaths).toFixed(2);
    },
    headshotPercentage() {
      const totalKills = this.kills;
      const headshotKills = this.playerStats?.headshot_kills_aggregate?.aggregate?.count || 0;
      if (!totalKills) return 0;
      return ((headshotKills / totalKills) * 100).toFixed(1);
    },
    winRate() {
      const wins = this.playerStats?.map_wins?.aggregate?.count || 0;
      const losses = this.playerStats?.map_losses?.aggregate?.count || 0;
      const total = wins + losses;
      if (!total) return 0;
      return ((wins / total) * 100).toFixed(1);
    },
  },
};
</script>