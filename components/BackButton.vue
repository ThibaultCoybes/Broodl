<template>
    <button 
      class="back-btn"
      :class="{ 'back-btn-floating': floating }"
      @click="handleBack"
      :aria-label="label"
    >
      <span class="back-icon">{{ icon }}</span>
      <span v-if="showLabel && !floating" class="back-label">{{ label }}</span>
    </button>
  </template>
  
<script setup>
  const props = defineProps({
    // Type de retour
    to: {
      type: String,
      default: null // null = history.back()
    },
    
    // Apparence
    floating: {
      type: Boolean,
      default: false
    },
    
    showLabel: {
      type: Boolean,
      default: true
    },
    
    // Personnalisation
    icon: {
      type: String,
      default: '←'
    },
    
    label: {
      type: String,
      default: 'Retour'
    },
    
    // Variantes
    variant: {
      type: String,
      default: 'default', // default | primary | ghost
      validator: (value) => ['default', 'primary', 'ghost'].includes(value)
    }
  })
  
  const router = useRouter()
  
  const handleBack = () => {
    if (props.to) {
      // Navigation vers une route spécifique
      router.push(props.to)
    } else {
      // Retour navigation history
      if (window.history.length > 1) {
        router.back()
      } else {
        // Fallback si pas d'historique
        router.push('/')
      }
    }
  }
</script>
  
<style scoped>
  /* Bouton de base */
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-sm);
    
    padding: var(--space-sm) var(--space-md);
    background: none;
    border: none;
    border-radius: var(--radius-md);
    
    color: var(--text-secondary);
    font-size: var(--text-base);
    font-family: inherit;
    cursor: pointer;
    
    min-height: var(--touch-target);
    transition: var(--transition-bounce);
    
    /* Touch feedback */
    -webkit-tap-highlight-color: transparent;
    user-select: none;
  }
  
  .back-btn:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.1);
  }
  
  /* Variante floating */
  .back-btn-floating {
    position: fixed;
    top: calc(var(--safe-top) + var(--space-lg));
    left: var(--space-lg);
    z-index: 40;
    
    width: var(--touch-target);
    height: var(--touch-target);
    padding: 0;
    
    background: var(--bg-glass);
    backdrop-filter: var(--blur-xl);
    border: 1px solid var(--border-primary);
    border-radius: 50%;
    
    box-shadow: var(--shadow-md);
    
    justify-content: center;
  }
  
  .back-btn-floating:active {
    transform: scale(0.9);
    box-shadow: var(--shadow-sm);
  }
  
  /* Icône */
  .back-icon {
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    transition: var(--transition-fast);
  }
  
  .back-btn:hover .back-icon {
    transform: translateX(-2px);
  }
  
  .back-btn-floating .back-icon {
    font-size: var(--text-xl);
  }
  
  /* Label */
  .back-label {
    font-weight: var(--font-medium);
    font-size: var(--text-sm);
  }
  
  /* Variantes de couleur */
  .back-btn.variant-primary {
    background: var(--gradient-primary);
    color: var(--text-primary);
    box-shadow: var(--shadow-primary);
  }
  
  .back-btn.variant-primary:active {
    box-shadow: var(--shadow-sm);
  }
  
  .back-btn.variant-ghost {
    background: transparent;
    color: var(--text-muted);
  }
  
  .back-btn.variant-ghost:active {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-secondary);
  }
  
  /* Hover desktop */
  @media (pointer: fine) {
    .back-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
    }
    
    .back-btn-floating:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-lg);
      border-color: var(--border-hover);
    }
    
    .back-btn.variant-primary:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-glow);
    }
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .back-btn-floating {
      width: 40px;
      height: 40px;
      top: calc(var(--safe-top) + var(--space-md));
      left: var(--space-md);
    }
    
    .back-icon {
      font-size: var(--text-base);
    }
    
    .back-btn-floating .back-icon {
      font-size: var(--text-lg);
    }
  }
  
  /* Animation d'entrée pour floating */
  .back-btn-floating {
    animation: slideInLeft 0.3s ease;
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
</style>