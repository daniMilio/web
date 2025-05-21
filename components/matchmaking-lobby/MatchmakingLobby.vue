<script setup lang="ts">
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import PlayerSearch from "~/components/PlayerSearch.vue";
import { CheckIcon, XIcon, LogOut, Users } from "lucide-vue-next";
import FriendsList from "./FriendsList.vue";
import { Mail } from "lucide-vue-next";
import MatchmakingLobbyAccess from "~/components/matchmaking-lobby/MatchmakingLobbyAccess.vue";
</script>

<template>
  <div v-if="navbar && currentLobby && currentLobby.players.length > 0" class="flex items-center justify-start bg-[#181A20] border border-[#23262F] rounded-full px-3 py-1 w-fit">
    <Users class="w-5 h-5 text-[#777] mr-2" />
    <div class="flex items-center">
      <div
        v-for="player in currentLobby.players"
        class="relative group"
      >
        <NuxtLink :to="{ name: 'players-id', params: { id: player.player.steam_id } }" custom v-slot="{ navigate }">
          <div @click="navigate" class="cursor-pointer">
            <PlayerDisplay
              :player="player.player"
              :avatarOnly="true"
              :showOnline="false"
              size="xs"
            />
          </div>
        </NuxtLink>
        <button
          v-if="(player.status === 'Invited' || player.status === 'Accepted') &&
                  player.player.steam_id !== me?.steam_id &&
                  isCaptain"
          @click="removeFromLobby(currentLobby.id, player.player.steam_id)"
          class="absolute left-1/2 bottom-0 bg-red-600 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style="transform: translate(-50%,50%);"
          title="Remove player"
        >
          <XIcon class="w-3 h-3 text-white" />
        </button>
      </div>
    </div>
    <button
      v-if="currentLobby.players.some(p => p.player.steam_id === me?.steam_id)"
      @click="removeFromLobby(currentLobby.id, me?.steam_id)"
      class="ml-2 bg-red-600 rounded-full px-2 py-1 text-xs text-white font-semibold hover:bg-red-700 transition-colors"
      title="Leave lobby"
    >
      {{$t('matchmaking.lobby.leave')}}
    </button>
  </div>
  <div v-else class="flex flex-col gap-4 overflow-auto">
    <template v-if="currentLobby">
      <div class="flex flex-row justify-between items-center" v-if="!mini">
        <div class="flex flex-row items-center gap-2">
          <h3 class="text-lg font-medium">
            {{ $t("matchmaking.lobby.title") }}
          </h3>
          <!--<MatchmakingLobbyAccess :lobby="currentLobby" />-->
        </div>
      </div>

      <player-search
        :label="$t('matchmaking.lobby.invite_player')"
        :self="false"
        @selected="(player) => inviteToLobby(player.steam_id)"
        v-if="!mini && !isLobbyFull"
      ></player-search>

      <template v-for="player of currentLobby?.players">
        <div
          :class="{
            'flex flex-row justify-between items-center': !mini,
            'animate-pulse border-2 border-dashed border-white/50 p-1':
              player.status === 'Invited',
          }"
        >
          <PlayerDisplay
            :player="player.player"
            :showOnline="false"
            :showName="!mini"
            :showFlag="!mini"
          />
          <div class="flex gap-2">
            <Button
              variant="destructive"
              size="icon"
              @click="removeFromLobby(currentLobby.id, player.player.steam_id)"
              v-if="
                !mini &&
                (player.status === 'Invited' || player.status === 'Accepted') &&
                player.player.steam_id !== me?.steam_id &&
                isCaptain
              "
            >
              <XIcon class="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              @click="removeFromLobby(currentLobby.id, me?.steam_id)"
              v-if="!mini && player.player.steam_id === me?.steam_id"
            >
              <LogOut class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </template>
    </template>

    <div class="grid gap-4" v-if="invitedLobbies?.length > 0">
      <template v-if="mini">
        <div class="flex items-center justify-center">
          <Button variant="outline" size="icon" class="relative">
            <Mail class="h-4 w-4" />
            <div
              class="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500"
            ></div>
          </Button>
        </div>
      </template>

      <div class="flex flex-col gap-4" v-else>
        <h3 class="text-lg font-medium">
          {{ $t("matchmaking.lobby.invites") }}
        </h3>
        <div class="flex flex-col gap-2" v-for="lobby of invitedLobbies">
          <div class="flex items-center justify-between">
            <PlayerDisplay
              v-for="{ player } of lobby.players.filter(
                (p) => p.player.steam_id !== me?.steam_id,
              )"
              :key="player.steam_id"
              :player="player"
              :showOnline="false"
              class="w-fit"
            />

            <div class="flex gap-2">
              <Button
                variant="secondary"
                size="icon"
                @click="joinLobby(lobby.id)"
              >
                <CheckIcon class="h-4 w-4" />
              </Button>
              <Button
                variant="destructive"
                size="icon"
                @click="removeFromLobby(lobby.id, me?.steam_id)"
              >
                <XIcon class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template v-if="!currentLobby">
      <Separator class="my-4" v-if="invitedLobbies?.length > 0" />

      <FriendsList :mini="mini" :isLobbyFull="isLobbyFull" />
    </template>
  </div>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { playerFields } from "~/graphql/playerFields";
import { $ } from "~/generated/zeus";

export default {
  props: {
    mini: {
      type: Boolean,
      default: false,
    },
    navbar: {
      type: Boolean,
      default: false,
    },
    avatarOnly: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:isLobbyFull'],
  data() {
    return {
      lobbies: null,
    };
  },
  watch: {
    isLobbyFull(newValue) {
      this.$emit('update:isLobbyFull', newValue);
    }
  },
  apollo: {
    $subscribe: {
      lobbies: {
        query: typedGql("subscription")({
          lobbies: [
            {
              where: {
                players: {
                  steam_id: {
                    _eq: $("steam_id", "bigint!"),
                  },
                },
              },
            },
            {
              id: true,
              access: true,
              players: [
                {},
                {
                  status: true,
                  captain: true,
                  player: playerFields,
                },
              ],
            },
          ],
        }),
        variables() {
          return {
            steam_id: this.me?.steam_id,
          };
        },
        result({ data }: { data: any }) {
          this.lobbies = data.lobbies;
        },
      },
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    isCaptain() {
      const me = this.currentLobby?.players.find(({ player }) => {
        return this.me.steam_id === player.steam_id;
      });
      return me?.captain;
    },
    currentLobby() {
      return this.lobbies?.find((lobby: any) => {
        return lobby.id === this.me?.current_lobby_id;
      });
    },
    isLobbyFull() {
      if (!this.currentLobby) return false;
      const activePlayers = this.currentLobby.players.filter(
        (player: any) => player.status === 'Accepted' || player.status === 'Invited'
      ).length;
      return activePlayers >= 5;
    },
    invitedLobbies() {
      return this.lobbies?.filter((lobby: any) => {
        return lobby.id !== this.me?.current_lobby_id;
      });
    },
  },
  methods: {
    async removeFromLobby(lobby_id: string, steam_id: string) {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          delete_lobby_players_by_pk: [
            {
              lobby_id,
              steam_id,
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async joinLobby(lobby_id: string) {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          update_lobby_players_by_pk: [
            {
              pk_columns: {
                lobby_id,
                steam_id: this.me?.steam_id,
              },
              _set: {
                status: "Accepted",
              },
            },
            {
              __typename: true,
            },
          ],
        }),
      });
    },
    async inviteToLobby(steam_id: string) {
      await useMatchmakingStore().inviteToLobby(steam_id);
    },
  },
};
</script>
