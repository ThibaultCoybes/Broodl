<template>
  <div class="app-layout">
    <main class="main-content">
      <slot />
    </main>
    
    <BottomNav />
  </div>
</template>

<script setup>
// Layout simplifié grâce au composable centralisé
</script>

<style>
.main-content {
  padding-bottom: calc(80px + var(--safe-bottom));
}
</style>