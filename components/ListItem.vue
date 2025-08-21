<template>
    <div :class="['list-item', { 'list-item-clickable': clickable }]" @click="handleClick">
      <!-- Avatar/Icon à gauche -->
      <div v-if="$slots.avatar" class="list-item-avatar">
        <slot name="avatar" />
      </div>
      
      <!-- Contenu principal -->
      <div class="list-item-content">
        <!-- Titre avec badges optionnels -->
        <div v-if="title || $slots.title" class="list-item-title">
          <slot name="title">
            <span>{{ title }}</span>
          </slot>
          <slot name="badges" />
        </div>
        
        <!-- Sous-titre/description -->
        <div v-if="subtitle || $slots.subtitle" class="list-item-subtitle">
          <slot name="subtitle">
            <span>{{ subtitle }}</span>
          </slot>
        </div>
        
        <!-- Contenu libre -->
        <slot name="content" />
      </div>
      
      <!-- Actions à droite -->
      <div v-if="$slots.actions" class="list-item-actions">
        <slot name="actions" />
      </div>
    </div>
</template>

<script setup>
  const props = defineProps({
    title: { 
      type: String, 
      default: null 
    },
    subtitle: { 
      type: String, 
      default: null 
    },
    clickable: { 
      type: Boolean, 
      default: false 
    }
  })
  
  const emit = defineEmits(['click'])
  
  const handleClick = (event) => {
    if (props.clickable) {
      emit('click', event)
    }
  }
</script>
  
<style scoped>
  .list-item {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: rgba(255, 255, 255, 0.02);
    border-radius: var(--radius-lg);
    transition: var(--transition-fast);
  }
  
  .list-item-clickable {
    cursor: pointer;
  }
  
  .list-item-clickable:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  
  .list-item-clickable:active {
    transform: scale(0.99);
  }
  
  .list-item-avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .list-item-content {
    flex: 1;
    min-width: 0; /* Pour éviter les débordements */
  }
  
  .list-item-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    font-weight: var(--font-semibold);
    color: var(--text-primary);
    margin-bottom: var(--space-xs);
    line-height: 1.3;
  }
  
  .list-item-title span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .list-item-subtitle {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }
  
  .list-item-subtitle span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .list-item-actions {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-xs);
    text-align: right;
  }
  
  /* Responsive */
  @media (max-width: 480px) {
    .list-item {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-md);
    }
    
    .list-item-actions {
      align-self: stretch;
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
    
    .list-item-title,
    .list-item-subtitle {
      text-align: left;
    }
  }
</style>