<template>
    <label class="visibility-option">
      <input 
        :value="value"
        :checked="modelValue === value"
        type="radio" 
        class="visibility-radio"
        @change="$emit('update:modelValue', value)"
      >
      <div class="visibility-content">
        <span class="visibility-icon">{{ icon }}</span>
        <span class="visibility-name">{{ name }}</span>
      </div>
    </label>
</template>

<script setup>
  defineProps({
    modelValue: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  })
  
  defineEmits(['update:modelValue'])
</script>

<style scoped>
  .visibility-option {
    flex: 1;
    position: relative;
    cursor: pointer;
  }
  
  .visibility-radio {
    position: absolute;
    opacity: 0;
  }
  
  .visibility-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-lg);
    background: var(--bg-glass);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    transition: var(--transition-fast);
    min-height: var(--touch-target);
    text-align: center;
  }
  
  .visibility-radio:checked + .visibility-content {
    background: var(--gradient-primary);
    color: var(--text-primary);
    border-color: transparent;
  }
  
  .visibility-icon {
    font-size: var(--text-xl);
  }
  
  .visibility-name {
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
  }
</style>