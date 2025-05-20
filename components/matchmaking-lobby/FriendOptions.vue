<script lang="ts" setup>
import { Plus, Check, Ban } from "lucide-vue-next";

const buttonClass = "flex items-center justify-center px-3 hover:bg-gray-100 rounded-r-lg transition-colors border-l border-l-gray-200 group focus:outline-none focus:ring-0 active:outline-none active:ring-0 focus:shadow-none active:shadow-none border-transparent focus:border-transparent active:border-transparent button-artifact-fix";
</script>

<template>
  <div class="flex items-stretch w-full">
    <div class="flex-1">
      <slot></slot>
    </div>

    <template v-if="!hideInvite">
      <template v-if="player.status === 'Pending'">
        <div class="flex flex-col">
          <button
            type="button"
            class="flex items-center justify-center px-3 hover:bg-gray-100 transition-colors border-l border-l-gray-200 group h-7 focus:outline-none focus:ring-0 active:outline-none active:ring-0 focus:shadow-none active:shadow-none border-transparent focus:border-transparent active:border-transparent button-artifact-fix rounded-tr-lg"
            @click="acceptFriend"
          >
            <Check
              class="h-4 w-4 text-green-500 hover:text-green-600 transition-colors cursor-pointer"
            />
          </button>
          <div class="h-px w-full bg-gray-200"></div>
          <button
            type="button"
            class="flex items-center justify-center px-3 hover:bg-gray-100 transition-colors border-l border-l-gray-200 group h-7 focus:outline-none focus:ring-0 active:outline-none active:ring-0 focus:shadow-none active:shadow-none border-transparent focus:border-transparent active:border-transparent button-artifact-fix rounded-br-lg"
            @click="denyFriend"
          >
            <Ban
              class="h-4 w-4 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            />
          </button>
        </div>
      </template>
      <template v-else>
        <DropdownMenu v-if="canInviteToMatch" class="h-full">
          <DropdownMenuTrigger :class="buttonClass">
            <Plus class="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </DropdownMenuTrigger>
          <DropdownMenuContent class="w-48">
            <DropdownMenuItem @click="inviteToLobby">
              <span>{{ $t("matchmaking.friends.invite_to_lobby") }}</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="inviteToMatch">
              <span>{{ $t("matchmaking.friends.invite_to_match") }}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button 
          v-else
          @click="inviteToLobby" 
          :class="buttonClass"
        >
          <Plus class="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </button>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { generateMutation } from "~/graphql/graphqlGen";
import { e_lobby_access_enum } from "~/generated/zeus";

export default {
  props: {
    player: {
      type: Object,
      required: true,
    },
    hideInvite: {
      type: Boolean,
      default: false,
      required: false,
    },
  },
  computed: {
    me() {
      return useAuthStore().me;
    },
    currentMatch() {
      return useMatchLobbyStore().currentMatch;
    },
    canInviteToMatch() {
      return (
        this.currentMatch &&
        this.currentMatch.options.lobby_access.includes([
          e_lobby_access_enum.Open,
          e_lobby_access_enum.Friends,
          e_lobby_access_enum.Invite,
        ])
      );
    },
    invitedToMatch() {
      if (!this.currentMatch) {
        return false;
      }

      return this.currentMatch.invites.find(
        (invite) => invite.steam_id === this.player.steam_id,
      );
    },
  },
  methods: {
    async acceptFriend() {
      await this.$apollo.mutate({
        mutation: typedGql("mutation")({
          update_my_friends: [
            {
              where: {
                steam_id: {
                  _eq: this.player.steam_id,
                },
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
    async denyFriend() {
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
    async inviteToLobby() {
      await useMatchmakingStore().inviteToLobby(this.player.steam_id);
    },
    async inviteToMatch() {
      if (!this.currentMatch) {
        return;
      }

      await this.$apollo.mutate({
        mutation: generateMutation({
          insert_match_invites_one: [
            {
              object: {
                steam_id: this.player.steam_id,
                match_id: this.currentMatch.id,
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