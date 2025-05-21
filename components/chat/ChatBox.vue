<script setup lang="ts">
import ChatLobby from './ChatLobby.vue';
import { Minimize2, Maximize2 } from 'lucide-vue-next';
import { ref } from 'vue';

const props = defineProps<{
  instance: string;
  lobbyId: string;
  type: 'match' | 'team' | 'matchmaking';
}>();

const isCollapsed = ref(false);
</script>

<template>
  <div class="fixed bottom-4 right-[calc(var(--sidebar-width)_+_1rem)] z-50 transition-all duration-300 ease-in-out max-h-[calc(100vh-2rem)]"
       :class="isCollapsed ? 'w-[200px]' : 'w-[400px]'">
    <div class="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg shadow-lg border hover:shadow-xl transition-shadow overflow-hidden">
      <div 
        @click="isCollapsed = !isCollapsed"
        class="flex items-center justify-between p-2 border-b bg-sidebar cursor-pointer hover:bg-accent transition-colors flex-shrink-0"
      >
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm">Lobby chat</span>
        </div>
        <Minimize2 v-if="!isCollapsed" class="h-4 w-4" />
        <Maximize2 v-else class="h-4 w-4" />
      </div>
      <div 
        class="transition-all duration-300 ease-in-out bg-sidebar flex-1 overflow-hidden"
        :class="isCollapsed ? 'h-0 overflow-hidden' : 'h-auto'"
      >
        <ChatLobby class="bg-sidebar"
          :instance="instance"
          :lobby-id="lobbyId"
          :type="type"
        />
      </div>
    </div>
  </div>
</template> 