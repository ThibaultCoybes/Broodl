<template>
  <nav v-if="shouldShowBottomNav" class="bottom-nav">
    <div class="nav-background"></div>
    
    <div class="nav-container">
      <NuxtLink 
        v-for="item in navItems" 
        :key="item.path"
        :to="item.path"
        class="nav-item"
        :class="{ 
          'active': isActive(item.path, route.path),
          'create-btn': item.isSpecial
        }"
      >
        <div class="nav-icon-container">
          <span class="nav-icon">{{ item.icon }}</span>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup>
const route = useRoute()

// Utiliser le composable centralisé pour la navigation
const { navItems, shouldShowNavigation, isActive } = useNavigation()

// Conditions d'affichage
const shouldShowBottomNav = computed(() => {
  // Mobile uniquement
  if (import.meta.client && window.innerWidth > 1024) {
    return false
  }

  // Authentifié uniquement
  const isAuthenticated = import.meta.client ? 
    !!localStorage.getItem('auth-token') || 
    !!useCookie('accessToken').value : false

  if (!isAuthenticated) {
    return false
  }

  // Utiliser la fonction centralisée
  return shouldShowNavigation(route.path)
})
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 40;
  animation: slideInUp 0.3s ease;
}

.nav-background {
  position: absolute;
  inset: 0;
  background: var(--bg-glass);
  backdrop-filter: var(--blur-xl);
  border-top: 1px solid var(--border-primary);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
}

.nav-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: var(--space-md) var(--space-lg);
  padding-bottom: calc(var(--space-md) + var(--safe-bottom));
  min-height: var(--touch-target);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xs);
  
  flex: 1;
  max-width: 80px;
  padding: var(--space-sm);
  
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition-bounce);
  min-height: var(--touch-target);
}

.nav-item:active {
  transform: scale(0.95);
}

.nav-item.active {
  color: var(--text-primary);
}

/* Bouton spécial créer */
.nav-item.create-btn .nav-icon-container {
  background: var(--gradient-primary);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  transform: translateY(-8px);
  box-shadow: var(--shadow-primary);
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-bounce);
  padding: var(--space-sm);
  border-radius: var(--radius-lg);
}

.nav-item.active .nav-icon-container {
  background: rgba(168, 85, 247, 0.2);
}

.nav-icon {
  font-size: var(--text-xl);
  font-weight: bold;
  transition: var(--transition-bounce);
  user-select: none;
}

.nav-item.active .nav-icon {
  transform: scale(1.1);
  filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.8));
}

.nav-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-align: center;
  white-space: nowrap;
}

/* Responsive */
@media (min-width: 1025px) {
  .bottom-nav {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: var(--space-sm);
    padding-bottom: calc(var(--space-sm) + var(--safe-bottom));
  }
  
  .nav-item {
    max-width: 70px;
    gap: 2px;
  }
  
  .nav-icon {
    font-size: var(--text-lg);
  }
  
  .nav-label {
    font-size: 10px;
  }
  
  .nav-item.create-btn .nav-icon-container {
    width: 40px;
    height: 40px;
    transform: translateY(-6px);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>