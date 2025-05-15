<script setup lang="ts">
import LeftNav from "./LeftNav.vue";
import RightNav from "./RightNav.vue";
import MainContent from "./MainContent.vue";
import RightSidebar from "./RightSidebar.vue";
import { useMediaQuery } from "@vueuse/core";
import { useAuthStore } from "~/stores/AuthStore";
import { useApplicationSettingsStore } from "~/stores/ApplicationSettings";
import { useMatchmakingStore } from "~/stores/MatchmakingStore";
import { getCountryForTimezone } from "countries-and-timezones";
import { generateMutation, generateQuery } from "~/graphql/graphqlGen";
import { useApolloClient } from "@vue/apollo-composable";

interface Region {
  status: string;
}

const navMenuOpened = ref(false);
const profileOpened = ref(false);
const showLogoutModal = ref(false);
const rightSidebarOpen = ref(false);

const isMedium = useMediaQuery("(max-width: 1400px)");
const isMobile = useMediaQuery("(max-width: 768px)");
const authStore = useAuthStore();
const me = computed(() => authStore.me);
const isAdmin = authStore.isAdmin;
const regions = useApplicationSettingsStore().availableRegions as Region[];
const playersOnline = useMatchmakingStore().playersOnline;
const { client } = useApolloClient();

const overalRegionStatus = computed(() => {
  const statuses = regions?.map((region: Region) => region.status);

  if (!statuses) {
    return;
  }

  if (statuses.every((status: string) => status === "Online")) {
    return "Online";
  } else if (statuses.every((status: string) => status === "Offline")) {
    return "Offline";
  } else {
    return "Degraded";
  }
});

const detectedCountry = computed(() => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const country = getCountryForTimezone(timezone);
  return country?.id;
});

watch(isMedium, (newValue: boolean) => {
  if (newValue) {
    rightSidebarOpen.value = false;
  } else {
    rightSidebarOpen.value = true;
  }
}, { immediate: true });

watch(detectedCountry, async (newValue: string | undefined) => {
  if (!me.value || me.value.country) {
    return;
  }

  await client.mutate({
    mutation: generateMutation({
      update_players_by_pk: [
        {
          pk_columns: {
            steam_id: me.value.steam_id,
          },
          _set: {
            country: newValue,
          },
        },
        {
          __typename: true,
        },
      ],
    }),
  });
}, { immediate: true });

async function logout() {
  await client.mutate({
    mutation: generateMutation({
      logout: [
        {},
        {
          success: true,
        },
      ],
    }),
  });

  navigateTo("/");
  window.location.reload();
}
</script>

<template>
  <div class="h-screen flex flex-col" data-nav="top">
    <!-- Navigation - fixed at the top -->
    <nav class="border-b fixed top-0 left-0 right-0 z-50" style="background-color: #11131a">
      <div class="mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <LeftNav
            :is-medium="isMedium"
            :is-admin="isAdmin"
            :me="me"
            v-model:nav-menu-opened="navMenuOpened"
          />
          <RightNav
            :is-admin="isAdmin"
            :me="me"
            :overal-region-status="overalRegionStatus"
            v-model:profile-opened="profileOpened"
            @show-logout-modal="showLogoutModal = $event"
          />
        </div>
      </div>
    </nav>

    <!-- Main content area -->
    <div class="flex flex-col md:flex-row flex-1">
      <MainContent :is-medium="isMedium">
        <slot></slot>
      </MainContent>

      <RightSidebar
        :is-medium="isMedium"
        :is-mobile="isMobile"
        :me="me"
        v-model:right-sidebar-open="rightSidebarOpen"
      />
    </div>
  </div>

  <AlertDialog
    v-if="showLogoutModal"
    :open="showLogoutModal"
    @update:open="(open) => (showLogoutModal = open)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{
          $t("layouts.app_nav.logout_dialog.title")
        }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t("layouts.app_nav.logout_dialog.description") }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{
          $t("layouts.app_nav.logout_dialog.cancel")
        }}</AlertDialogCancel>
        <AlertDialogAction @click="logout">{{
          $t("layouts.app_nav.logout_dialog.confirm")
        }}</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>