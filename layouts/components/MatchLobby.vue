<script lang="ts" setup>
import { ArrowLeftRight } from "lucide-vue-next";
import PlayerStatusDisplay from "~/components/match/PlayerStatusDisplay.vue";
</script>

<template>
  <NuxtLink
    :to="canSwitch ? { name: 'matches-id', params: { id: match.id } } : null"
    class="flex gap-2 items-center cursor-pointer"
  >
    <TooltipProvider v-for="member of myLineup">
      <Tooltip>
        <TooltipTrigger as-child>
          <PlayerStatusDisplay
            :member="member"
            :match="match"
            :show-details="false"
            :linkable="false"
            size="xs"
            v-if="member.player"
          />
          <template v-else>
            <Avatar shape="square">
              <AvatarFallback>
                {{ member.placeholder_name.slice(0, 2) }}
              </AvatarFallback>
            </Avatar>
          </template>
        </TooltipTrigger>
        <TooltipContent>
          {{ member.placeholder_name || member.player.name }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>

    <span class="text-xs font-bold text-red-400/90 dark:text-red-400/90">{{
      $t("layouts.match_lobby.versus")
    }}</span>

    <TooltipProvider v-for="member of otherLineUp">
      <Tooltip>
        <TooltipTrigger as-child>
          <PlayerStatusDisplay
            :member="member"
            :match="match"
            :show-details="false"
            size="xs"
            v-if="member.player"
          />
          <template v-else>
            <Avatar shape="square">
              <AvatarFallback>
                {{ member.placeholder_name.slice(0, 2) }}
              </AvatarFallback>
            </Avatar>
          </template>
        </TooltipTrigger>
        <TooltipContent>
          {{ member.placeholder_name || member.player.name }}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <Button
      class="flex gap-2 text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white animate-pulse"
      v-if="showSwitch"
    >
      <ArrowLeftRight />
    </Button>
  </NuxtLink>
</template>

<script lang="ts">
import socket from "~/web-sockets/Socket";
export default {
  props: {
    match: {
      required: true,
      type: Object,
    },
    showSwitch: {
      default: false,
      type: Boolean,
    },
    canSwitch: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      lobby: undefined,
    };
  },
  created() {
    this.lobby = socket.joinLobby(`match-lobby`, "match", this.match.id);
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    matchId() {
      return this.match.id;
    },
    myLineup() {
      if (!this.match) {
        return;
      }
      const { lineup_1, lineup_2 } = this.match;

      return (
        lineup_1.is_on_lineup
          ? lineup_1.lineup_players
          : lineup_2.lineup_players
      ).sort((a, b) => {
        if (a.player?.steam_id === this.me?.steam_id) {
          return -1;
        }
        if (b.player?.steam_id === this.me?.steam_id) {
          return 1;
        }
        return 0;
      });
    },
    otherLineUp() {
      if (!this.match) {
        return;
      }
      const { lineup_1, lineup_2 } = this.match;

      return lineup_1.is_on_lineup
        ? lineup_2.lineup_players
        : lineup_1.lineup_players;
    },
  },
  unmounted() {
    this.lobby?.leave();
  },
};
</script>
