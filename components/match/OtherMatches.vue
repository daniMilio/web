<script lang="ts" setup>
import Pagination from "~/components/Pagination.vue";
import MatchesTable from "~/components/MatchesTable.vue";
</script>
<template>
  <matches-table
    class="p-3"
    :matches="otherMatches"
    v-if="otherMatches"
  ></matches-table>

  <Teleport defer to="#pagination">
    <Pagination
      :page="page"
      :per-page="perPage"
      @page="
        (_page) => {
          page = _page;
        }
      "
      :total="otherMatchesAggregate?.aggregate?.count"
      v-if="otherMatchesAggregate"
    ></Pagination>
  </Teleport>
</template>

<script lang="ts">
import { typedGql } from "~/generated/zeus/typedDocumentNode";
import { simpleMatchFields } from "~/graphql/simpleMatchFields";
import { $, order_by } from "~/generated/zeus";

export default {
  data() {
    return {
      page: 1,
      perPage: 10,
      otherMatches: [],
      otherMatchesAggregate: undefined,
    };
  },
  apollo: {
    $subscribe: {
      matches: {
        query: typedGql("subscription")({
          matches: [
            {
              limit: $("limit", "Int!"),
              offset: $("offset", "Int!"),
              order_by: [
                {},
                {
                  created_at: $("order_by", "order_by"),
                },
              ],
              where: {
                is_in_lineup: {
                  _eq: false,
                },
              },
            },
            simpleMatchFields,
          ],
        }),
        variables: function () {
          return {
            limit: this.perPage,
            order_by: order_by.desc,
            offset: (this.page - 1) * this.perPage,
          };
        },
        result: function ({ data }) {
          this.otherMatches = data.matches;
        },
      },
      otherMatchesAggregate: {
        query: typedGql("subscription")({
          matches_aggregate: [
            {
              where: {
                is_in_lineup: {
                  _eq: false,
                },
              },
            },
            {
              aggregate: {
                count: true,
              },
            },
          ],
        }),
        result: function ({ data }) {
          this.otherMatchesAggregate = data.matches_aggregate;
        },
      },
    },
  },
};
</script>
