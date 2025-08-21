<template>
    <div :class="['avatar', sizeClass]">
      <img 
        v-if="avatarUrl && !showFallback" 
        :src="avatarUrl" 
        :alt="name"
        @error="showFallback = true"
      >
      <span v-else>{{ initials }}</span>
    </div>
</template>

<script setup>
  import { ref, computed } from 'vue'
  
  const props = defineProps({
    name: { 
      type: String, 
      required: true 
    },
    avatarUrl: { 
      type: String, 
      default: null 
    },
    size: { 
      type: String, 
      default: 'md',
      validator: (value) => ['sm', 'md', 'lg'].includes(value)
    }
  })
  
  const showFallback = ref(false)
  
  const initials = computed(() => {
    if (!props.name) return '?'
    return props.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  })
  
  const sizeClass = computed(() => `avatar-${props.size}`)
</script>
  
<style scoped>
  .avatar {
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    font-weight: var(--font-semibold);
    flex-shrink: 0;
    overflow: hidden;
  }
  
  .avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .avatar-sm {
    width: 32px;
    height: 32px;
    font-size: var(--text-xs);
  }
  
  .avatar-md {
    width: 48px;
    height: 48px;
    font-size: var(--text-sm);
  }
  
  .avatar-lg {
    width: 64px;
    height: 64px;
    font-size: var(--text-base);
  }
</style>