<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { Switch } from "~/components/ui/switch";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/Pagination.vue";
import PageHeading from "~/components/PageHeading.vue";
import PlayerDisplay from "~/components/PlayerDisplay.vue";
import PlayerElo from "~/components/PlayerElo.vue";
import debounce from "~/utilities/debounce";
</script>

<template>
  <div class="flex-grow flex flex-col gap-4">
    <PageHeading>
      <template #title>{{ $t("pages.players.title") }}</template>
    </PageHeading>
    <Card class="p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="flex items-center justify-between m-4">
              <span>{{ $t("pages.players.search") }}</span>

              <div>
                <form
                  class="flex-grow flex justify-end"
                  @submit.prevent="viewTopPlayer"
                >
                  <FormField name="playerQuery" v-slot="{ componentField }">
                    <FormItem>
                      <FormControl>
                        <div class="relative w-full max-w-sm">
                          <Input
                            v-model="query"
                            type="text"
                            :placeholder="$t('pages.players.search')"
                            class="pl-10"
                            v-bind="componentField"
                          />
                          <Search
                            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5"
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  </FormField>
                  <div class="flex items-center gap-2 ml-4">
            <Switch
              class="text-sm text-muted-foreground cursor-pointer flex items-center gap-2"
              :model-value="onlineOnly"
              @click="toggleOnlineOnly"
            />
            {{ $t("player.search.online_only") }}
          </div>
                </form>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="player of players"
            @click="viewPlayer(player.steam_id)"
            class="cursor-pointer"
          >
            <TableCell class="font-medium">
              <PlayerDisplay :player="player"></PlayerDisplay>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <Pagination
      :page="page"
      :per-page="per_page"
      @page="
        (_page) => {
          page = _page;
        }
      "
      :total="pagination.total"
      v-if="pagination"
    ></Pagination>
  </div>
</template>

<script lang="ts">
interface Player {
  steam_id: string;
  role?: string;
  name: string;
  avatar_url?: string;
  country?: string;
  is_banned?: boolean;
  is_muted?: boolean;
  is_gagged?: boolean;
}

interface SearchResponse {
  hits: Array<{
    document: Player;
  }>;
}

import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
export default {
  data() {
    return {
      page: 1,
      per_page: 10,
      query: "",
      debouncedSearch: debounce((query: string) => {
        this.searchPlayers(query);
      }, 300),
      players: undefined,
      pagination: undefined,
      form: useForm({
        validationSchema: toTypedSchema(
          z.object({
            playerQuery: z.string(),
          }),
        ),
      }),
    };
  },
  watch: {
    query(newQuery: string) {
      this.debouncedSearch(newQuery);
    },
    page: {
      immediate: true,
      handler() {
        this.searchPlayers();
      },
    },
    "form.values.playerQuery": {
      immediate: true,
      handler() {
        this.page = 1;
        this.searchPlayers();
      },
    },
  },
  computed: {
    onlineOnly: {
      get() {
        return useSearchStore().onlineOnly;
      },
      set(value: boolean) {
        localStorage.setItem("playerSearchOnlineOnly", value.toString());
        useSearchStore().onlineOnly = value;
      },
    },
  },
  methods: {
    toggleOnlineOnly() {
      this.onlineOnly = !this.onlineOnly;
      this.searchPlayers();
    },
    viewTopPlayer() {
      const player = this.players?.at(0);
      if (!player) {
        return;
      }

      this.viewPlayer(player.steam_id);
    },
    viewPlayer(steam_id) {
      this.$router.push(`/players/${steam_id}`);
    },
    async searchPlayers() {

      this.query = this.form.values.playerQuery || "";

      if (this.onlineOnly) {
        this.players = useSearchStore().search(this.query, "");
        return;
      }

      const response = await $fetch("/api/players-search", {
        method: "post",
        body: {
          page: this.page,
          query: this.form.values.playerQuery,
          per_page: this.per_page,
        },
      });

      const { found, hits } = response;

      this.pagination = {
        total: found,
      };

      this.players = (response as SearchResponse).hits.map(({ document }) => {
        return {
          role: document.role,
          steam_id: document.steam_id,
          name: document.name,
          avatar_url: document.avatar_url,
          country: document.country,
          is_banned: document.is_banned,
          is_muted: document.is_muted,
          is_gagged: document.is_gagged,
        } as Player;
      });
    },
  },
};
</script>
