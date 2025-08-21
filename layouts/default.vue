<template>
  <div class="app-layout">
    <main class="main-content">
      <slot />
    </main>
    
    <BottomNav 
      :nav-items="broodlNavItems"
      :auto-hide="false"
    />
  </div>
</template>

<script setup>

const broodlNavItems = [
  {
    path: '/dashboard',
    icon: '📊',
    label: 'Dashboard',
    badge: 0
  },
  {
    path: '/challenge',
    icon: '🎯', 
    label: 'Défis',
    badge: 3 
  },
  {
    path: '/challenge/create',
    icon: '➕',
    label: 'Créer',
    isSpecial: true 
  },
  {
    path: '/profile',
    icon: '👤',
    label: 'Profil',
    badge: 0
  }
]
</script>

<style>
.main-content {
  padding-bottom: calc(80px + var(--safe-bottom));
}
</style>