<script lang="ts" setup>
import { Info } from "lucide-vue-next";
</script>

<template>
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger type="button">
        <slot name="trigger">
          <Info :size="size" v-bind="$attrs"> </Info>
        </slot>
      </TooltipTrigger>
      <TooltipContent>
        <slot></slot>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script lang="ts">
export default {
  inheritAttrs: false,
  props: {
    size: {
      type: Number,
      default: 12,
    },
  },
};
</script>
