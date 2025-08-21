<template>
  <div 
    class="challenge-card-mini card"
    @click="handleClick"
  >
    <div class="challenge-mini-header">
      <span class="challenge-icon">{{ challenge.icon }}</span>
      <div class="challenge-urgency" :class="urgency">
        <span class="status-dot" :class="challenge.status"/>
        {{ urgencyText }}
      </div>
    </div>
    
    <h3 class="challenge-title">{{ challenge.title }}</h3>
    
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${Math.min(challenge.progress, 100)}%` }"
        ></div>
        <!-- ✅ Barre de dépassement si > 100% -->
        <div 
          v-if="challenge.progress > 100"
          class="progress-overflow"
          :style="{ width: `${Math.min(challenge.progress - 100, 50)}%` }"
        ></div>
      </div>
    </div>
    
    <div class="challenge-stats">
      <span>{{ formatValue(challenge.currentValue) }} / {{ formatValue(challenge.targetValue) }} {{ challenge.unit }}</span>
      <span :class="{ 'overflow': challenge.progress > 100 }">{{ challenge.progress }}%</span>
    </div>
    
    <div class="challenge-date">
      <span>Fin: {{ formatDate(challenge.endDate) }}</span>
      <span>{{ getDaysLeft(challenge.endDate) }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  challenge: {
    type: Object,
    required: true,
    validator: (challenge) => {
      return challenge && 
             challenge.id && 
             challenge.title && 
             challenge.icon &&
             challenge.endDate &&
             typeof challenge.progress === 'number' &&
             typeof challenge.currentValue === 'number' &&
             typeof challenge.targetValue === 'number'
    }
  }
})

const emit = defineEmits(['click'])

const urgency = computed(() => {
  const daysLeft = getDaysLeftNumber(props.challenge.endDate)
  
  if (daysLeft <= 2) return 'high'
  if (daysLeft <= 7) return 'medium'
  return 'low'
})

const urgencyText = computed(() => {
  const urgencyMap = {
    'high': 'Urgent',
    'medium': 'Bientôt', 
    'low': 'En cours'
  }
  return urgencyMap[urgency.value] || 'En cours'
})

const handleClick = () => {
  emit('click', props.challenge.id)
}

// ✅ Formatage des valeurs pour éviter les décimales inutiles
const formatValue = (value) => {
  if (typeof value !== 'number') return value
  return value % 1 === 0 ? value.toString() : value.toFixed(1)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short'
  })
}

const getDaysLeftNumber = (endDate) => {
  const today = new Date()
  const end = new Date(endDate)
  const diffTime = end - today
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const getDaysLeft = (endDate) => {
  const diffDays = getDaysLeftNumber(endDate)
  
  if (diffDays < 0) return 'Terminé'
  if (diffDays === 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Demain'
  return `Dans ${diffDays} jours`
}
</script>

<style scoped>
.challenge-card-mini {
  padding: var(--space-xl);
  cursor: pointer;
  transition: var(--transition-base);
}

.challenge-card-mini:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-hover);
}

.challenge-mini-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.challenge-icon {
  font-size: var(--text-xl);
}

.challenge-urgency {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.challenge-urgency.high { color: var(--color-error); }
.challenge-urgency.medium { color: var(--color-warning); }
.challenge-urgency.low { color: var(--color-success); }

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.active { background: var(--color-success); }
.status-dot.ending_soon { background: var(--color-warning); }
.status-dot.completed { background: var(--color-primary); }

.challenge-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.progress-container {
  margin-bottom: var(--space-lg);
}

.progress-bar {
  position: relative;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: visible;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 3px;
  transition: width var(--transition-normal);
}

/* ✅ Barre de dépassement */
.progress-overflow {
  position: absolute;
  top: 0;
  left: 100%;
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #dc2626);
  border-radius: 0 3px 3px 0;
  opacity: 0.8;
}

.challenge-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.challenge-stats .overflow {
  color: var(--color-warning);
  font-weight: var(--font-bold);
}

.challenge-date {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: var(--text-xs);
  color: var(--text-muted);
}
</style>