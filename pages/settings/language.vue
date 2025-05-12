<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";

definePageMeta({
  layout: "profile-settings",
});

definePageMeta({
  layout: "profile-settings",
});
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      {{ $t("pages.settings.language.title") }}
    </h3>
    <p class="text-sm text-muted-foreground">
      {{ $t("pages.settings.language.description") }}
    </p>
  </div>
  <Separator class="my-6" />

  <div class="grid gap-4"></div>
</template>
