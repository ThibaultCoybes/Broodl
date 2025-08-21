<template>
    <label class="radio-option" :class="{ disabled: disabled }">
      <input 
        :value="value"
        :checked="modelValue === value"
        :disabled="disabled"
        type="radio" 
        class="radio-input"
        @change="$emit('update:modelValue', value)"
      >
      <div :class="['radio-content', { disabled: disabled }]">
        <span v-if="icon" class="radio-icon">{{ icon }}</span>
        <div class="radio-info">
          <span class="radio-name">{{ name }}</span>
          <span v-if="description" class="radio-desc">{{ description }}</span>
        </div>
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
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  })
  
  defineEmits(['update:modelValue'])
</script>

<style scoped>
  .radio-option {
    position: relative;
    cursor: pointer;
    display: block;
  }
  
  .radio-option.disabled {
    cursor: not-allowed;
  }
  
  .radio-input {
    position: absolute;
    opacity: 0;
  }
  
  .radio-content {
    display: flex;
    align-items: center;
    gap: var(--space-lg);
    padding: var(--space-lg);
    background: var(--bg-glass);
    border: 1px solid var(--border-primary);
    border-radius: var(--radius-lg);
    transition: var(--transition-fast);
    min-height: var(--touch-target);
  }
  
  .radio-content.disabled {
    opacity: 0.5;
    background: var(--bg-glass);
    border-color: var(--border-primary);
    cursor: not-allowed;
  }
  
  .radio-input:checked + .radio-content {
    background: var(--gradient-primary);
    color: var(--text-primary);
    border-color: transparent;
  }
  
  .radio-input:disabled + .radio-content {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .radio-icon {
    font-size: var(--text-xl);
  }
  
  .radio-info {
    display: flex;
    flex-direction: column;
  }
  
  .radio-name {
    font-weight: var(--font-semibold);
    font-size: var(--text-base);
  }
  
  .radio-desc {
    font-size: var(--text-sm);
    opacity: 0.8;
  }
</style>