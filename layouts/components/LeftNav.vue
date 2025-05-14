<script setup lang="ts">
import { Menu } from "lucide-vue-next";
import { e_player_roles_enum } from "~/generated/zeus";
import NavLink from "~/components/NavLink.vue";

defineProps<{
  isMedium: boolean
  isAdmin: boolean
  me: any
}>();

const emit = defineEmits<{
  (e: 'update:navMenuOpened', value: boolean): void
}>();

const navMenuOpened = defineModel<boolean>('navMenuOpened');
</script>

<template>
  <div class="flex items-center space-x-4 font-semibold text-lg uppercase font-teko">
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
            <NuxtLink to="/" class="flex items-center gap-2 px-2 py-1.5">
              <NuxtImg class="rounded max-w-6" src="/favicon/64.png" />
            </NuxtLink>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem as-child>
            <NavLink :to="{ name: 'play' }" :is-active="isRouteActive('play')" :is-dropdown="true">
              {{ $t("layouts.app_nav.navigation.play") }}
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NavLink :to="{ name: 'matches' }" :is-active="isRouteActive('matches')" :is-dropdown="true">
              {{ $t("layouts.app_nav.navigation.matches") }}
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NavLink :to="{ name: 'tournaments' }" :is-active="isRouteActive('tournaments')" :is-dropdown="true">
              {{ $t("layouts.app_nav.navigation.tournaments") }}
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NavLink :to="{ name: 'players' }" :is-active="isRouteActive('players')" :is-dropdown="true">
              {{ $t("layouts.app_nav.navigation.players") }}
            </NavLink>
          </DropdownMenuItem>
          <DropdownMenuItem as-child>
            <NavLink :to="{ name: 'teams' }" :is-active="isRouteActive('teams')" :is-dropdown="true">
              {{ $t("layouts.app_nav.navigation.teams") }}
            </NavLink>
          </DropdownMenuItem>

          <!-- Admin menu items -->
          <template v-if="me?.role === e_player_roles_enum.administrator">
            <DropdownMenuSeparator />
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'map-pools' }" :is-active="isRouteActive('map-pools')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.map_pools") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'regions' }" :is-active="isRouteActive('regions')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.regions") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'dedicated-servers' }" :is-active="isRouteActive('dedicated-servers')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.dedicated_servers") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'game-server-nodes' }" :is-active="isRouteActive('game-server-nodes')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.game_server_nodes") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'system-logs' }" :is-active="isRouteActive('system-logs')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.logs") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'system-metrics' }" :is-active="isRouteActive('system-metrics')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.metrics") }}
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuItem as-child>
              <NavLink :to="{ name: 'settings-application' }" :is-active="isRouteActive('settings-application')" :is-dropdown="true">
                {{ $t("layouts.app_nav.administration.app_settings") }}
              </NavLink>
            </DropdownMenuItem>
          </template>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>

    <!-- Regular navigation for larger screens -->
    <template v-else>
      <NavLink :to="{ name: 'play' }" :is-active="isRouteActive('play')">
        {{ $t("layouts.app_nav.navigation.play") }}
      </NavLink>
      <NavLink :to="{ name: 'matches' }" :is-active="isRouteActive('matches')">
        {{ $t("layouts.app_nav.navigation.matches") }}
      </NavLink>
      <NavLink :to="{ name: 'tournaments' }" :is-active="isRouteActive('tournaments')">
        {{ $t("layouts.app_nav.navigation.tournaments") }}
      </NavLink>
      <NavLink :to="{ name: 'players' }" :is-active="isRouteActive('players')">
        {{ $t("layouts.app_nav.navigation.players") }}
      </NavLink>
      <NavLink :to="{ name: 'teams' }" :is-active="isRouteActive('teams')">
        {{ $t("layouts.app_nav.navigation.teams") }}
      </NavLink>
      <div v-if="me?.role === e_player_roles_enum.administrator">
        <Separator orientation="vertical" class="h-4" />
      </div>
      <div v-if="me?.role === e_player_roles_enum.administrator" class="flex items-center space-x-4">
        <NavLink :to="{ name: 'map-pools' }" :is-active="isRouteActive('map-pools')">
          {{ $t("layouts.app_nav.administration.map_pools") }}
        </NavLink>
        <NavLink :to="{ name: 'regions' }" :is-active="isRouteActive('regions')">
          {{ $t("layouts.app_nav.administration.regions") }}
        </NavLink>
        <DropdownMenu v-model:open="serversOpened" class="cursor-pointer">
          <DropdownMenuTrigger as-child>
            <NavLink :to="{ name: 'dedicated-servers' }" :is-active="isRouteActive('dedicated-servers') || isRouteActive('game-server-nodes')">
              {{ $t("layouts.app_nav.administration.servers") }}
            </NavLink>
          </DropdownMenuTrigger>
          <DropdownMenuContent class="min-w-48 rounded-lg" align="start" :side-offset="4">
            <DropdownMenuGroup>
              <DropdownMenuItem class="cursor-pointer" as-child>
                <NavLink :to="{ name: 'dedicated-servers' }" :is-active="isRouteActive('dedicated-servers')" :is-dropdown="true">
                  {{ $t("layouts.app_nav.administration.dedicated_servers") }}
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem class="cursor-pointer" as-child>
                <NavLink :to="{ name: 'game-server-nodes' }" :is-active="isRouteActive('game-server-nodes')" :is-dropdown="true">
                  {{ $t("layouts.app_nav.administration.game_server_nodes") }}
                </NavLink>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <NavLink :to="{ name: 'system-logs' }" :is-active="isRouteActive('system-logs')">
          {{ $t("layouts.app_nav.administration.logs") }}
        </NavLink>
        <NavLink :to="{ name: 'system-metrics' }" :is-active="isRouteActive('system-metrics')">
          {{ $t("layouts.app_nav.administration.metrics") }}
        </NavLink>
        <NavLink :to="{ name: 'settings-application' }" :is-active="isRouteActive('settings-application')">
          {{ $t("layouts.app_nav.administration.app_settings") }}
        </NavLink>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      serversOpened: false
    }
  },
  methods: {
    isRouteActive(route: string) {
      if (route === 'play') {
        return this.$route.path === '/play';
      }
      return this.$route.path.startsWith(`/${route}`);
    }
  }
}
</script> 