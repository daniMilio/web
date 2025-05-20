<script setup lang="ts">
import { BookUser } from "lucide-vue-next";
import MatchmakingLobby from "~/components/matchmaking-lobby/MatchmakingLobby.vue";
import ChatBox from "~/components/chat/ChatBox.vue";
import FriendsList from "~/components/matchmaking-lobby/FriendsList.vue";
import { ref } from "vue";

const props = defineProps<{
  isMedium: boolean
  isMobile: boolean
  me: any
}>();

const rightSidebarOpen = defineModel<boolean>('rightSidebarOpen');
const isLobbyFull = ref(false);
</script>

<template>
  <div
    id="right-sidebar"
    class="duration-200 w-[--sidebar-width] transition-[width] ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))] border-l h-[calc(100vh-57px)] bg-sidebar fixed right-0 top-[57px]"
    style="--sidebar-width: 16rem; --sidebar-width-icon: 4.25rem"
    v-show="!isMedium"
  >
    <div
      id="right-sidebar-trigger"
      class="flex items-center justify-center"
      v-show="isMobile"
    ></div>
    <SidebarProvider :open="rightSidebarOpen" v-slot="{ isMobile }">
      <Teleport defer to="#right-sidebar-trigger">
        <SidebarTrigger @click="rightSidebarOpen = true" v-show="isMobile">
          <BookUser
            style="width: 1.5rem; height: 1.5rem"
            :class="{ 'rotate-180': !rightSidebarOpen }"
          />
        </SidebarTrigger>
      </Teleport>

      <Sidebar
        class="w-full h-full"
        variant="sidebar"
        collapsible="none"
        side="right"
        @click="rightSidebarOpen = true"
        :class="{ 'cursor-pointer': !rightSidebarOpen }"
      >
        <SidebarContent class="h-full overflow-y-auto">
          <SidebarGroup
            :class="{ 'overflow-hidden': !me.current_lobby_id }"
          >
            <SidebarMenu
              :class="{ 'overflow-hidden': !me.current_lobby_id }"
            >
              <MatchmakingLobby :mini="!rightSidebarOpen" v-model:isLobbyFull="isLobbyFull" />
            </SidebarMenu>
          </SidebarGroup>

          <SidebarGroup v-if="me.current_lobby_id" class="overflow-hidden">
            <SidebarSeparator class="my-0" />
            <FriendsList :mini="!rightSidebarOpen" :isLobbyFull="isLobbyFull" />
          </SidebarGroup>
          
          <SidebarGroup v-if="me.current_lobby_id">
            <ChatBox
              instance="matchmaking"
              :lobby-id="me.current_lobby_id"
              type="matchmaking"
              v-show="rightSidebarOpen"
            />
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  </div>
</template> 