<script setup lang="ts">
defineProps<{
  isMedium: boolean
}>();
</script>

<template>
  <div class="flex-1" :class="{ 'md:pr-[calc(var(--sidebar-width)+1rem)]': !isMedium }">
    <SidebarProvider class="bg-muted/40 h-full" v-slot="{ open, isMobile }">
      <SidebarInset
        id="main"
        class="bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
      >
        <div class="h-screen pt-[57px] overflow-y-auto" :class="{ 'md:pr-[calc(var(--sidebar-width)+1rem)]': !isMedium }">
          <slot></slot>
        </div>
      </SidebarInset>
    </SidebarProvider>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style> 