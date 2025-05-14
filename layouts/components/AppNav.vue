<script setup lang="ts">
import {
  BadgeCheck,
  LogOut,
  BookUser,
  Menu,
} from "lucide-vue-next";
import SystemUpdate from "./SystemUpdate.vue";
import RegionStatuses from "~/components/RegionStatuses.vue";
import AppNotifications from "./AppNotifications.vue";
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import MatchLobbies from "./MatchLobbies.vue";
import { e_player_roles_enum } from "~/generated/zeus";
import MatchmakingLobby from "~/components/matchmaking-lobby/MatchmakingLobby.vue";
import FriendsList from "~/components/matchmaking-lobby/FriendsList.vue";
import ChatLobby from "~/components/chat/ChatLobby.vue";
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navigation - always at the top -->
    <nav class="border-b" style="background-color: #11131a">
      <div class="mx-auto px-4 py-3">
        <div class="flex items-center justify-between">
          <!-- leftside nav bar -->
          <div
            class="flex items-center space-x-4 font-semibold text-lg uppercase font-teko"
          >
            <!-- Regular logo for larger screens -->
            <nuxt-link v-if="!isMedium" to="/">
              <NuxtImg class="rounded max-w-8" src="/favicon/64.png" />
            </nuxt-link>

            <!-- Hamburger menu for medium screens -->
            <DropdownMenu v-if="isMedium" v-model:open="navMenuOpened">
              <DropdownMenuTrigger class="p-2 hover:bg-gray-800 rounded-md">
                <Menu class="h-6 w-6 text-gray-200" />
              </DropdownMenuTrigger>
              <DropdownMenuContent class="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      to="/"
                      class="flex items-center gap-2 px-2 py-1.5"
                    >
                      <NuxtImg class="rounded max-w-6" src="/favicon/64.png" />
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      :to="{ name: 'play' }"
                      :class="{
                          'text-green-400/90': isRouteActive('play'),
                          'text-gray-200': true,
                          'w-full': true,
                          'flex': true,
                          'items-center': true,
                          'px-2': true,
                          'py-1.5': true
                        }"
                    >
                      {{ $t("layouts.app_nav.navigation.play") }}
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      :to="{ name: 'matches' }"
                      :class="{
                          'text-green-400/90': isRouteActive('matches'),
                          'text-gray-200': true,
                          'w-full': true,
                          'flex': true,
                          'items-center': true,
                          'px-2': true,
                          'py-1.5': true
                        }"
                    >
                      {{ $t("layouts.app_nav.navigation.matches") }}
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      :to="{ name: 'tournaments' }"
                      :class="{
                          'text-green-400/90': isRouteActive('tournaments'),
                          'text-gray-200': true,
                          'w-full': true,
                          'flex': true,
                          'items-center': true,
                          'px-2': true,
                          'py-1.5': true
                        }"
                    >
                      {{ $t("layouts.app_nav.navigation.tournaments") }}
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      :to="{ name: 'players' }"
                      :class="{
                          'text-green-400/90': isRouteActive('players'),
                          'text-gray-200': true,
                          'w-full': true,
                          'flex': true,
                          'items-center': true,
                          'px-2': true,
                          'py-1.5': true
                        }"
                    >
                      {{ $t("layouts.app_nav.navigation.players") }}
                    </NuxtLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem as-child>
                    <NuxtLink
                      :to="{ name: 'teams' }"
                      :class="{
                          'text-green-400/90': isRouteActive('teams'),
                          'text-gray-200': true,
                          'w-full': true,
                          'flex': true,
                          'items-center': true,
                          'px-2': true,
                          'py-1.5': true
                        }"
                    >
                      {{ $t("layouts.app_nav.navigation.teams") }}
                    </NuxtLink>
                  </DropdownMenuItem>

                  <!-- Admin menu items -->
                  <template
                    v-if="me?.role === e_player_roles_enum.administrator"
                  >
                    <DropdownMenuSeparator />
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'map-pools' }"
                        :class="{
                            'text-green-400/90': isRouteActive('map-pools'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.map_pools") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'regions' }"
                        :class="{
                            'text-green-400/90': isRouteActive('regions'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.regions") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'dedicated-servers' }"
                        :class="{
                            'text-green-400/90': isRouteActive('dedicated-servers'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.dedicated_servers") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'game-server-nodes' }"
                        :class="{
                            'text-green-400/90': isRouteActive('game-server-nodes'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.game_server_nodes") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'system-logs' }"
                        :class="{
                            'text-green-400/90': isRouteActive('system-logs'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.logs") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'system-metrics' }"
                        :class="{
                            'text-green-400/90': isRouteActive('system-metrics'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.metrics") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem as-child>
                      <NuxtLink
                        :to="{ name: 'settings-application' }"
                        :class="{
                            'text-green-400/90': isRouteActive('settings-application'),
                            'text-gray-200': true,
                            'w-full': true,
                            'flex': true,
                            'items-center': true,
                            'px-2': true,
                            'py-1.5': true
                          }"
                      >
                        {{ $t("layouts.app_nav.administration.app_settings") }}
                      </NuxtLink>
                    </DropdownMenuItem>
                  </template>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <!-- Regular navigation for larger screens -->
            <template v-else>
              <NuxtLink
                :to="{ name: 'play' }"
                :class="{
                    'text-green-400/90': isRouteActive('play'),
                    'px-2': true,    
                    'text-gray-200': true, 
                    'transition-colors': true,
                    'hover:text-gray-300': !isRouteActive('play'),
                    'flex': true,
                    'items-center': true,
                    'h-full': true,
                    'pt-1': true
                  }"
              >
                {{ $t("layouts.app_nav.navigation.play") }}
              </NuxtLink>
              <NuxtLink
                :to="{ name: 'matches' }"
                :class="{
                    'text-green-400/90': isRouteActive('matches'),
                    'px-2': true,
                    'text-gray-200': true, 
                    'transition-colors': true,
                    'hover:text-gray-300': !isRouteActive('matches'),
                    'flex': true,
                    'items-center': true,
                    'h-full': true,
                    'pt-1': true
                  }"
              >
                {{ $t("layouts.app_nav.navigation.matches") }}
              </NuxtLink>
              <NuxtLink
                :to="{ name: 'tournaments' }"
                :class="{
                    'text-green-400/90': isRouteActive('tournaments'),
                    'px-2': true,
                    'text-gray-200': true, 
                    'transition-colors': true,
                    'hover:text-gray-300': !isRouteActive('tournaments'),
                    'flex': true,
                    'items-center': true,
                    'h-full': true,
                    'pt-1': true
                  }"
              >
                {{ $t("layouts.app_nav.navigation.tournaments") }}
              </NuxtLink>
              <NuxtLink
                :to="{ name: 'players' }"
                :class="{
                    'text-green-400/90': isRouteActive('players'),
                    'px-2': true,
                    'text-gray-200': true, 
                    'transition-colors': true,
                    'hover:text-gray-300': !isRouteActive('players'),
                    'flex': true,
                    'items-center': true,
                    'h-full': true,
                    'pt-1': true
                  }"
              >
                {{ $t("layouts.app_nav.navigation.players") }}
              </NuxtLink>
              <NuxtLink
                :to="{ name: 'teams' }"
                :class="{
                    'text-green-400/90': isRouteActive('teams'),
                    'px-2': true,
                    'text-gray-200': true, 
                    'transition-colors': true,
                    'hover:text-gray-300': !isRouteActive('teams'),
                    'flex': true,
                    'items-center': true,
                    'h-full': true,
                    'pt-1': true
                  }"
              >
                {{ $t("layouts.app_nav.navigation.teams") }}
              </NuxtLink>
              <div v-if="me?.role === e_player_roles_enum.administrator">
                <Separator orientation="vertical" class="h-4" />
              </div>
              <div
                v-if="me?.role === e_player_roles_enum.administrator"
                class="flex items-center space-x-4"
              >
                <NuxtLink
                  :to="{ name: 'map-pools' }"
                  :class="{
                      'text-green-400/90': isRouteActive('map-pools'),
                      'px-2': true,
                      'text-gray-200': true, 
                      'transition-colors': true,
                      'hover:text-gray-300': !isRouteActive('map-pools'),
                      'flex': true,
                      'items-center': true,
                      'h-full': true,
                      'pt-1': true
                    }"
                >
                  {{ $t("layouts.app_nav.administration.map_pools") }}
                </NuxtLink>
                <NuxtLink
                  :to="{ name: 'regions' }"
                  :class="{
                      'text-green-400/90': isRouteActive('regions'),
                      'px-2': true,
                      'text-gray-200': true, 
                      'transition-colors': true,
                      'hover:text-gray-300': !isRouteActive('regions'),
                      'flex': true,
                      'items-center': true,
                      'h-full': true,
                      'pt-1': true
                    }"
                >
                  {{ $t("layouts.app_nav.administration.regions") }}
                </NuxtLink>
                <DropdownMenu
                  v-model:open="serversOpened"
                  class="cursor-pointer"
                >
                  <DropdownMenuTrigger as-child>
                    <NuxtLink
                      class="flex items-center gap-2 cursor-pointer"
                      :class="{
                          'text-green-400/90': isRouteActive('dedicated-servers') || isRouteActive('game-server-nodes'),
                          'px-2': true,
                          'text-gray-200': true, 
                          'transition-colors': true,
                          'hover:text-gray-300': true,
                          'flex': true,
                          'items-center': true,
                          'h-full': false,
                          'pt-1': true
                        }"
                    >
                      {{ $t("layouts.app_nav.administration.servers") }}
                    </NuxtLink>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    class="min-w-48 rounded-lg"
                    align="start"
                    :side-offset="4"
                  >
                    <DropdownMenuGroup>
                      <DropdownMenuItem class="cursor-pointer" as-child>
                        <NuxtLink
                          :to="{ name: 'dedicated-servers' }"
                          :class="{
                              'text-green-400/90': isRouteActive('dedicated-servers'),
                              'px-2': true,
                              'text-gray-200': true, 
                              'transition-colors': true,
                              'hover:text-gray-300': !isRouteActive('dedicated-servers'),
                              'flex': true,
                              'items-center': true,
                              'h-full': true,
                              'pt-1': true
                            }"
                        >
                          {{ $t("layouts.app_nav.administration.dedicated_servers") }}
                        </NuxtLink>
                      </DropdownMenuItem>

                      <DropdownMenuItem class="cursor-pointer" as-child>
                        <NuxtLink
                          :to="{ name: 'game-server-nodes' }"
                          :class="{
                              'text-green-400/90': isRouteActive('game-server-nodes'),
                              'px-2': true,
                              'text-gray-200': true, 
                              'transition-colors': true,
                              'hover:text-gray-300': !isRouteActive('game-server-nodes'),
                              'flex': true,
                              'items-center': true,
                              'h-full': true,
                              'pt-1': true
                            }"
                        >
                          {{ $t("layouts.app_nav.administration.game_server_nodes") }}
                        </NuxtLink>
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
                <NuxtLink
                  :to="{ name: 'system-logs' }"
                  :class="{
                      'text-green-400/90': isRouteActive('system-logs'),
                      'px-2': true,
                      'text-gray-200': true, 
                      'transition-colors': true,
                      'hover:text-gray-300': !isRouteActive('system-logs'),
                      'flex': true,
                      'items-center': true,
                      'h-full': true,
                      'pt-1': true
                    }"
                >
                  {{ $t("layouts.app_nav.administration.logs") }}
                </NuxtLink>
                <NuxtLink
                  :to="{ name: 'system-metrics' }"
                  :class="{
                      'text-green-400/90': isRouteActive('system-metrics'),
                      'px-2': true,
                      'text-gray-200': true, 
                      'transition-colors': true,
                      'hover:text-gray-300': !isRouteActive('system-metrics'),
                      'flex': true,
                      'items-center': true,
                      'h-full': true,
                      'pt-1': true
                    }"
                >
                  {{ $t("layouts.app_nav.administration.metrics") }}
                </NuxtLink>
                <NuxtLink
                  :to="{ name: 'settings-application' }"
                  :class="{
                      'text-green-400/90': isRouteActive('settings-application'),
                      'px-2': true,
                      'text-gray-200': true, 
                      'transition-colors': true,
                      'hover:text-gray-300': !isRouteActive('settings-application'),
                      'flex': true,
                      'items-center': true,
                      'h-full': true,
                      'pt-1': true
                    }"
                >
                  {{ $t("layouts.app_nav.administration.app_settings") }}
                </NuxtLink>
              </div>
            </template>
          </div>

          <!-- rightside nav bar -->
          <div class="flex items-center space-x-4">
            <MatchLobbies></MatchLobbies>
            <SystemUpdate v-if="isAdmin"></SystemUpdate>
            <Popover v-if="me?.role === e_player_roles_enum.administrator">
              <PopoverTrigger>
                <div
                  class="flex items-center gap-2 text-sm text-muted-foreground pt-1"
                >
                  <div class="relative inline-flex">
                    <span
                      class="absolute inline-flex h-2 w-2 rounded-full animate-ping"
                      :class="{
                'bg-red-500': overalRegionStatus === 'Offline',
                'bg-yellow-500': overalRegionStatus === 'Degraded',
              }"
                      v-if="overalRegionStatus !== 'Online'"
                    ></span>
                    <span
                      class="relative inline-flex h-2 w-2 rounded-full"
                      :class="{
                'bg-green-500': overalRegionStatus === 'Online',
                'bg-red-500': overalRegionStatus === 'Offline',
                'bg-yellow-500': overalRegionStatus === 'Degraded',
              }"
                      :title="overalRegionStatus"
                    ></span>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent>
                <RegionStatuses></RegionStatuses>
              </PopoverContent>
            </Popover>

            <AppNotifications></AppNotifications>
            <DropdownMenu v-model:open="profileOpened">
              <DropdownMenuTrigger as-child>
                <PlayerDisplay
                  :player="me"
                  :show-online="false"
                  :show-role="false"
                  :show-flag="false"
                  :show-name="false"
                  size="xs"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                class="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                :side-offset="4"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel class="font-normal">
                    <PlayerDisplay :player="me" :show-online="false" />
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem class="flex gap-2 cursor-pointer" as-child>
                    <NuxtLink
                      :to="{ name: 'settings' }"
                      :class="{
                'router-link-active': isRouteActive('settings'),
              }"
                    >
                      <BadgeCheck class="size-4" />
                      {{ $t("layouts.app_nav.profile.my_account") }}
                    </NuxtLink>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  class="flex gap-2"
                  @click="showLogoutModal = true"
                >
                  <LogOut class="size-4" />
                  {{ $t("layouts.app_nav.profile.logout") }}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>

    <div
      class="flex flex-col md:flex-row flex-1 max-h-[calc(100vh-57px)] overflow-hidden"
    >
      <!-- Main content - takes remaining space -->
      <div class="flex-1">
        <SidebarProvider class="bg-muted/40" v-slot="{ open, isMobile }">
          <SidebarInset
            id="main"
            class="bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] overflow-hidden"
          >
            <slot></slot>
          </SidebarInset>
        </SidebarProvider>
      </div>

      <!-- Right sidebar - full width on mobile, fixed width on desktop -->
      <div
        id="right-sidebar"
        class="duration-200 w-[--sidebar-width] transition-[width] ease-linear group-data-[collapsible=offcanvas]:w-0 group-data-[side=right]:rotate-180 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))] border-l h-[calc(100vh-3.5rem)] bg-sidebar"
        style="--sidebar-width: 24rem; --sidebar-width-icon: 4.25rem"
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
            class="w-full"
            variant="sidebar"
            collapsible="none"
            side="right"
            @click="rightSidebarOpen = true"
            :class="{ 'cursor-pointer': !rightSidebarOpen }"
          >
            <SidebarContent>
              <SidebarGroup
                :class="{ 'overflow-hidden': !me.current_lobby_id }"
              >
                <SidebarMenu
                  :class="{ 'overflow-hidden': !me.current_lobby_id }"
                >
                  <MatchmakingLobby :mini="!rightSidebarOpen" />
                </SidebarMenu>
              </SidebarGroup>

              <SidebarGroup v-if="me.current_lobby_id">
                <ChatLobby
                  instance="matchmaking"
                  :lobby-id="me.current_lobby_id"
                  type="matchmaking"
                  v-show="rightSidebarOpen"
                />
              </SidebarGroup>

              <SidebarGroup v-if="me.current_lobby_id" class="overflow-hidden">
                <SidebarSeparator class="my-4" />
                <FriendsList :mini="!rightSidebarOpen" />
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
        </SidebarProvider>
      </div>
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

<script lang="ts">
import { generateMutation } from "~/graphql/graphqlGen";
import { getCountryForTimezone } from "countries-and-timezones";
import { useApplicationSettingsStore } from "~/stores/ApplicationSettings";
import { useMediaQuery } from "@vueuse/core";
import { generateQuery } from "~/graphql/graphqlGen";

export default {
  data() {
    return {
      serversOpened: false,
      profileOpened: false,
      languageOpened: false,
      navMenuOpened: false,
      showLogoutModal: false,
      showPlayersOnline: false,
      rightSidebarOpen: false,
      isMobile: false,
    };
  },
  apollo: {
    telemetryStats: {
      query: generateQuery({
        telemetryStats: {
          online: true,
          __typename: true,
        },
      }),
      pollInterval: 60 * 1000,
      skip() {
        if (!this.me || this.me.role !== e_player_roles_enum.administrator) {
          return true;
        }

        return useRuntimeConfig().public.webDomain !== "5stack.gg";
      },
    },
  },
  watch: {
    isMedium: {
      immediate: true,
      handler(newValue) {
        if (newValue) {
          this.rightSidebarOpen = false;
        } else {
          this.rightSidebarOpen = true;
        }
      },
    },
    detectedCountry: {
      immediate: true,
      async handler() {
        if (!this.me || this.me.country) {
          return;
        }

        await this.$apollo.mutate({
          mutation: generateMutation({
            update_players_by_pk: [
              {
                pk_columns: {
                  steam_id: this.me.steam_id,
                },
                _set: {
                  country: this.detectedCountry,
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
  },
  methods: {
    async logout() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          logout: [
            {},
            {
              success: true,
            },
          ],
        }),
      });

      // Redirect to home page or login page after successful logout
      navigateTo("/");

      window.location.reload();
    },
    isRouteActive(route: string) {
      return this.$route.name === route;
    },
  },
  computed: {
    inlobby() {
      return useAuthStore().me.current_lobby_id !== null;
    },
    isMedium() {
      return useMediaQuery("(max-width: 1400px)").value;
    },
    isMobile() {
      return useMediaQuery("(max-width: 768px)").value;
    },
    me() {
      return useAuthStore().me;
    },
    isAdmin() {
      return useAuthStore().isAdmin;
    },
    inviteLink() {
      return `https://${useRuntimeConfig().public.webDomain}/discord-invite`;
    },
    detectedCountry() {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const country = getCountryForTimezone(timezone);

      if (country) {
        return country.id;
      }
    },
    regions() {
      return useApplicationSettingsStore().availableRegions;
    },
    overalRegionStatus() {
      const statuses = this.regions?.map((region) => region.status);

      if (!statuses) {
        return;
      }

      if (statuses.every((status) => status === "Online")) {
        return "Online";
      } else if (statuses.every((status) => status === "Offline")) {
        return "Offline";
      } else {
        return "Degraded";
      }
    },
    playersOnline() {
      return useMatchmakingStore().playersOnline;
    },
  },
};
</script>