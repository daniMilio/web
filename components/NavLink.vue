<script setup lang="ts">
defineProps<{
  to: string | { name: string }
  isActive?: boolean
  isDropdown?: boolean
}>()
</script>

<template>
  <NuxtLink
    :to="to"
    :class="{
      'text-green-400/90': isActive,
      'hover:text-gray-300': !isActive && !isDropdown,
      ...(isDropdown ? dropdownNavLinkClasses : navLinkClasses)
    }"
  >
    <slot></slot>
  </NuxtLink>
</template>

<script lang="ts">
export default {
  computed: {
    navLinkClasses() {
      return {
        'px-2': true,
        'text-gray-200': true,
        'transition-colors': true,
        'flex': true,
        'items-center': true,
        'h-full': true,
        'pt-1': true
      }
    },
    dropdownNavLinkClasses() {
      return {
        'text-gray-200': true,
        'w-full': true,
        'flex': true,
        'items-center': true,
        'px-2': true,
        'py-1.5': true
      }
    }
  }
}
</script> 