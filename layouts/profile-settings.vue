<script setup lang="ts">
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { generateMutation } from "~/graphql/graphqlGen";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Link, Unlink } from "lucide-vue-next";
import { toast } from "@/components/ui/toast";
import Default from "~/layouts/default.vue";
</script>

<template>
  <default>
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">
        {{ $t("layouts.account_settings.title") }}
      </h2>
      <p class="text-muted-foreground">
        {{ $t("layouts.account_settings.description") }}
      </p>
    </div>
    <Separator class="my-6" />
    <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside class="w-full lg:w-auto">
        <nav
          class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 overflow-y-auto max-h-[300px] lg:max-h-none"
        >
          <nuxt-link to="/settings">
            <Button variant="ghost" class="w-full text-left justify-start">
              {{ $t("pages.settings.account.my_account") }}
            </Button>
          </nuxt-link>

          <nuxt-link to="/settings/appearance">
            <Button variant="ghost" class="w-full text-left justify-start">
              {{ $t("pages.settings.account.appearance") }}
            </Button>
          </nuxt-link>

          <nuxt-link to="/settings/matchmaking">
            <Button variant="ghost" class="w-full text-left justify-start">
              {{ $t("pages.settings.account.matchmaking") }}
            </Button>
          </nuxt-link>

          <template v-if="hasDiscordLinked">
            <Button
              variant="ghost"
              class="w-full text-left justify-start"
              @click.stop.prevent="showUnlinkDiscordDialog = true"
            >
              <Unlink class="mr-2 h-4 w-4" />
              {{ $t("pages.settings.account.discord.unlink") }}
            </Button>
          </template>

          <nuxt-link @click.native="linkDiscord" v-else-if="supportsDiscordBot">
            <Button variant="ghost" class="w-full text-left justify-start">
              <Link class="mr-2 h-4 w-4" />
              {{ $t("pages.settings.account.discord.link") }}
            </Button>
          </nuxt-link>
        </nav>
      </aside>
      <div class="flex-1 lg:max-w-2xl">
        <div class="space-y-6">
          <slot />
        </div>
      </div>
    </div>

    <AlertDialog :open="showUnlinkDiscordDialog">
      <AlertDialogTrigger asChild> </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{
            $t("pages.settings.account.discord.unlink_dialog.title")
          }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ $t("pages.settings.account.discord.unlink_dialog.description") }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showUnlinkDiscordDialog = false">
            {{ $t("pages.settings.account.discord.unlink_dialog.cancel") }}
          </AlertDialogCancel>
          <AlertDialogAction @click="unlinkDiscord" variant="destructive">
            {{ $t("pages.settings.account.discord.unlink_dialog.confirm") }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </default>
</template>

<script lang="ts">
export default {
  data() {
    return {
      showUnlinkDiscordDialog: false,
      showRequestNameChangeDialog: false,
    };
  },
  methods: {
    async linkDiscord() {
      if (this.hasDiscordLinked) {
        return;
      }

      window.location.href = `https://${useRuntimeConfig().public.webDomain}/auth/discord?redirect=${encodeURIComponent(
        window.location.toString(),
      )}`;
    },

    async unlinkDiscord() {
      await this.$apollo.mutate({
        mutation: generateMutation({
          unlinkDiscord: [
            {},
            {
              success: true,
            },
          ],
        }),
      });

      this.showUnlinkDiscordDialog = false;

      useAuthStore().getMe();

      toast({
        title: this.$t("pages.settings.account.discord.unlinked"),
      });
    },
  },
  computed: {
    hasDiscordLinked() {
      return useAuthStore().hasDiscordLinked;
    },
    supportsDiscordBot() {
      return useApplicationSettingsStore().supportsDiscordBot;
    },
  },
};
</script>

<style lang="postcss">
.router-link-exact-active {
  @apply bg-muted hover:bg-muted rounded-md;
}
</style>