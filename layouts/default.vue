<script setup lang="ts">
import AppNav from "~/layouts/components/AppNav.vue";
import AlertsContainer from "~/layouts/components/AlertsContainer.vue";
import MatchmakingConfirm from "~/components/matchmaking/MatchmakingConfirm.vue";
import PlayerNameRegistration from "~/components/PlayerNameRegistration.vue";
</script>

<template>
  <PlayerNameRegistration></PlayerNameRegistration>
  <MatchmakingConfirm></MatchmakingConfirm>
  <AlertsContainer></AlertsContainer>
  <div class="flex min-h-screen w-full flex-col">
    <AppNav>
      <div class="flex justify-center items-center">
        <main class="m-2 md:m-8 max-w-[1312px] w-full mx-auto">
          <slot></slot>
        </main>
      </div>
      
    </AppNav>
  </div>
</template>

<script lang="ts">
export default {};
</script>
