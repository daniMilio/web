<script lang="ts" setup>
import MatchLobby from "./MatchLobby.vue";
import { ArrowRight, ChevronDown } from "lucide-vue-next";
</script>

<template>
  <div class="flex gap-4 items-center">
    <template v-if="lobbies.length > 1">
      <Popover v-model:open="choosingLobby">
        <PopoverTrigger>
          <div class="hidden md:flex gap-0.5 px-0.5 py-0.5 border border-gray-200/50 dark:border-gray-700/50 rounded-sm shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-950" :style="`background: ${$colorMode?.value === 'dark' ? '#10131a' : '#fff'}; z-index: 10; box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);`">
            <NuxtLink
              :to="{ name: 'matches-id', params: { id: match.id } }"
              class="flex items-center gap-0.5 bg-accent/70 px-1 py-0.5 rounded-l-sm flex-shrink-0 text-green-400/90 hover:bg-green-400/10 focus:bg-green-400/20 transition-colors text-xs font-medium border-r border-gray-200/50 dark:border-gray-700/50"
              v-show="!onMatchPage"
            >
              <span class="text-green-400/90">{{ match.e_match_status.description }}</span>
              <ArrowRight class="h-3 w-3 text-green-400/90 ml-1" />
              <Button variant="outline" size="icon" class="h-6 w-6" v-if="lobbies.length > 1">
                <ChevronDown class="h-3 w-3" />
              </Button>
            </NuxtLink>
            <div class="flex items-center gap-0.5 pl-1">
              <MatchLobby
                :match="match"
                :can-switch="lobbies.length > 1"
                class="pr-1"
              ></MatchLobby>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent class="w-auto p-0">
          <Command>
            <CommandList>
              <CommandGroup>
                <template v-for="lobby in lobbies" :key="lobby.match.id">
                  <CommandItem
                    :value="lobby.match.id"
                    @select="selectLobby(lobby.match.id)"
                    v-if="match.id !== lobby.match.id"
                  >
                    <MatchLobby :match="lobby.match" :show-switch="true" />
                  </CommandItem>
                </template>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </template>
    <template v-else>
      <div class="hidden md:flex gap-0.5 px-0.5 py-0.5 border border-gray-200/50 dark:border-gray-700/50 rounded-sm shadow-sm hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-950" :style="`background: ${$colorMode?.value === 'dark' ? '#10131a' : '#fff'}; z-index: 10; box-shadow: 0 2px 8px 0 rgba(0,0,0,0.04);`">
        <NuxtLink
          :to="{ name: 'matches-id', params: { id: match.id } }"
          class="flex items-center gap-0.5 bg-accent/70 px-1 py-0.5 rounded-l-sm flex-shrink-0 text-green-400/90 hover:bg-green-400/10 focus:bg-green-400/20 transition-colors text-xs font-medium border-r border-gray-200/50 dark:border-gray-700/50"
          v-show="!onMatchPage"
        >
          <span class="text-green-400/90">{{ match.e_match_status.description }}</span>
          <ArrowRight class="h-3 w-3 text-green-400/90 ml-1" />
        </NuxtLink>
        <div class="flex items-center gap-0.5 pl-1">
          <MatchLobby
            :match="match"
            :can-switch="false"
            class="pr-1"
          ></MatchLobby>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      choosingLobby: false,
    };
  },
  computed: {
    lobbies() {
      return Array.from(useMatchLobbyStore().lobbies.values());
    },
    match() {
      if (this.matchId) {
        return useMatchLobbyStore().lobbies.get(this.matchId)?.match;
      }

      return this.lobbies.at(0)?.match;
    },
    onMatchPage() {
      return this.$route.path === `/matches/${this.match?.id}`;
    },
    matchId() {
      return useMatchLobbyStore().viewMatchLobby;
    },
  },
  methods: {
    selectLobby(matchId: string) {
      this.choosingLobby = false;
      useMatchLobbyStore().viewMatchLobby = matchId;
    },
  },
};
</script>
