<template>
    <div :class="['info-box', `info-box--${variant}`]">
      <span class="info-icon">{{ icon }}</span>
      <div class="info-content">
        <span v-if="title" class="info-title">{{ title }}</span>
        <span class="info-text">
          <slot>{{ message }}</slot>
        </span>
      </div>
    </div>
</template>

<script setup lang="ts">
  interface Props {
    variant?: 'info' | 'warning' | 'success' | 'error'
    icon?: string
    title?: string
    message?: string
  }
  
  const props = withDefaults(defineProps<Props>(), {
    variant: 'info',
    icon: 'ℹ️',
    title: '',
    message: ''
  })
</script>

<style scoped>
  .info-box {
    display: flex;
    align-items: flex-start;
    gap: var(--space-sm);
    padding: var(--space-lg);
    border-radius: var(--radius-lg);
    font-size: var(--text-sm);
    line-height: 1.4;
  }
  
  /* Variantes */
  .info-box--info {
    background: var(--bg-glass);
    border: 1px solid var(--border-primary);
    color: var(--text-secondary);
  }
  
  .info-box--warning {
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    color: rgb(217, 119, 6);
  }
  
  .info-box--success {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.3);
    color: rgb(21, 128, 61);
  }
  
  .info-box--error {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    color: rgb(185, 28, 28);
  }
  
  .info-icon {
    font-size: var(--text-base);
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .info-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    flex: 1;
  }
  
  .info-title {
    font-weight: var(--font-semibold);
    font-size: var(--text-sm);
  }
  
  .info-text {
    line-height: 1.4;
  }
  
  /* Mode sombre */
  @media (prefers-color-scheme: dark) {
    .info-box--warning {
      color: rgb(251, 191, 36);
    }
    
    .info-box--success {
      color: rgb(34, 197, 94);
    }
    
    .info-box--error {
      color: rgb(248, 113, 113);
    }
  }
</style>