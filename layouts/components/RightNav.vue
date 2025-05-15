<script setup lang="ts">
import { BadgeCheck, LogOut, User } from "lucide-vue-next";
import { e_player_roles_enum } from "~/generated/zeus";
import NavLink from "~/components/NavLink.vue";
import MatchLobbies from "./MatchLobbies.vue";
import SystemUpdate from "./SystemUpdate.vue";
import RegionStatuses from "~/components/RegionStatuses.vue";
import AppNotifications from "./AppNotifications.vue";
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

defineProps<{
  isAdmin: boolean
  me: any
  overalRegionStatus: string | undefined
}>();

const emit = defineEmits<{
  (e: 'showLogoutModal', value: boolean): void
}>();

const profileOpened = defineModel<boolean>('profileOpened');

const isRouteActive = (route: string) => {
  if (route === 'play') {
    return useRoute().path === '/play';
  }
  return useRoute().path.startsWith(`/${route}`);
};
</script>

<template>
  <div class="flex items-center space-x-4">
    <MatchLobbies></MatchLobbies>
    <SystemUpdate v-if="isAdmin"></SystemUpdate>
    <Popover v-if="me?.role === e_player_roles_enum.administrator">
      <PopoverTrigger>
        <div class="flex items-center gap-2 text-sm text-muted-foreground pt-1">
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
                <NavLink :to="{ name: 'players-id', params: { id: me.steam_id } }" :is-active="isRouteActive('players')" :is-dropdown="true">
                  <User class="size-4" />
                  {{ $t("layouts.app_nav.profile.my_profile") }}
                </NavLink>
            </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuItem class="flex gap-2 cursor-pointer" as-child>
            <NavLink :to="{ name: 'settings' }" :is-active="isRouteActive('settings')" :is-dropdown="true">
              <BadgeCheck class="size-4" />
              {{ $t("layouts.app_nav.profile.my_account") }}
            </NavLink>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem class="flex gap-2" @click="emit('showLogoutModal', true)">
          <LogOut class="size-4" />
          {{ $t("layouts.app_nav.profile.logout") }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
</template>

<script lang="ts">
export default {
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