<template>
    <div class="progress-container">
      <!-- Header avec pourcentage (optionnel) -->
      <div v-if="showHeader" class="progress-header">
        <h2 v-if="title">{{ title }}</h2>
        <span class="progress-percentage text-gradient">{{ percentage }}%</span>
      </div>
      
      <!-- Barre de progression -->
      <div class="progress-visual">
        <div :class="['progress-bar', `progress-${size}`]">
          <div 
            class="progress-fill" 
            :style="{ width: Math.min(percentage, 100) + '%' }"
          />
        </div>
        
        <!-- Valeurs (optionnel) -->
        <div v-if="showValues" class="progress-values">
          <span class="current-value">{{ current }} {{ unit }}</span>
          <span class="target-value">{{ target }} {{ unit }}</span>
        </div>
      </div>
    </div>
</template>

<script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    current: { 
      type: Number, 
      required: true 
    },
    target: { 
      type: Number, 
      required: true 
    },
    unit: { 
      type: String, 
      default: '' 
    },
    title: { 
      type: String, 
      default: null 
    },
    size: { 
      type: String, 
      default: 'large',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    showHeader: { 
      type: Boolean, 
      default: false 
    },
    showValues: { 
      type: Boolean, 
      default: true 
    }
  })
  
  const percentage = computed(() => {
    if (props.target <= 0) return 0
    return Math.round((props.current / props.target) * 100)
  })
</script>

<style scoped>
  .progress-container {
    width: 100%;
  }
  
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl);
  }
  
  .progress-header h2 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    margin: 0;
    color: var(--text-primary);
  }
  
  .progress-percentage {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
  }
  
  .progress-visual {
    width: 100%;
  }
  
  .progress-bar {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: var(--space-lg);
  }
  
  .progress-small {
    height: 8px;
  }
  
  .progress-medium {
    height: 12px;
  }
  
  .progress-large {
    height: 16px;
  }
  
  .progress-fill {
    height: 100%;
    background: var(--gradient-primary);
    transition: width 0.5s ease;
    border-radius: inherit;
  }
  
  .progress-values {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  
  .current-value {
    font-size: var(--text-2xl);
    font-weight: var(--font-bold);
    color: var(--text-primary);
  }
  
  .target-value {
    font-size: var(--text-lg);
    color: var(--text-secondary);
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .progress-percentage {
      font-size: var(--text-2xl);
    }
    
    .current-value {
      font-size: var(--text-xl);
    }
    
    .target-value {
      font-size: var(--text-base);
    }
  }
</style>