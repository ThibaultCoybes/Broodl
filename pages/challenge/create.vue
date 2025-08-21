<template>
  <div class="create-page">
    <header class="page-header">
      <button class="back-btn" @click="$router.back()">
        ← Retour
      </button>
      <h1 class="page-title text-gradient">Créer un défi</h1>
    </header>

    <form class="create-form" @submit.prevent="handleSubmit">
      
      <div class="form-section">
        <label class="form-label">Type de défi</label>
        <div class="challenge-types">
          <button 
            v-for="type in challengeTypes" 
            :key="type.id"
            type="button"
            :class="['type-btn', { active: form.category === type.id }]"
            @click="selectCategory(type.id as CategoryType)"
          >
            <span class="type-icon">{{ type.icon }}</span>
            <span class="type-name">{{ type.name }}</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Titre du défi</label>
        <input 
          v-model="form.title"
          type="text" 
          :placeholder="currentConfig?.placeholder || 'Mon nouveau défi'"
          class="form-input"
          required
        >
      </div>

      <div class="form-section">
        <label class="form-label">Description</label>
        <textarea 
          v-model="form.description"
          placeholder="Décrivez votre défi en quelques mots..."
          class="form-textarea"
          rows="3"
        />
      </div>

      <div class="form-section">
        <label class="form-label">Objectif à atteindre</label>
        <div class="objective-inputs">
          <input 
            v-model.number="form.targetValue"
            type="number" 
            placeholder="100"
            class="form-input objective-value"
            required
          >
          <input 
            v-if="!currentConfig?.unit"
            v-model="form.unit"
            type="text" 
            :placeholder="currentConfig?.unitPlaceholder || 'unité...'"
            class="form-input objective-unit"
            required
          >
          <div v-else class="form-input objective-unit unit-fixed">
            {{ currentConfig.unit }}
          </div>
        </div>
      </div>

      <div class="form-section">
        <label class="form-label">Date de fin</label>
        <input 
          v-model="form.endDate"
          type="date" 
          class="form-input"
          :min="getTodayDate()"
          required
        >
      </div>

      <!-- Section Type : Individual ou Group -->
      <div v-if="currentConfig" class="form-section">
        <label class="form-label">Pour qui ?</label>
        <div class="radio-group">
          <RadioOption
            v-if="currentConfig.types.includes('individual')"
            v-model="form.type"
            value="individual"
            name="Personnel"
            description="Objectif privé, seul"
            icon="👤"
          />
          <RadioOption
            v-if="currentConfig.types.includes('group')"
            v-model="form.type"
            value="group"
            name="Groupe"
            description="Avec participants"
            icon="👥"
          />
        </div>
      </div>

      <!-- Section Mode : toujours affichée si Group -->
      <div v-if="form.type === 'group' && currentConfig" class="form-section">
        <label class="form-label">Mode du groupe</label>
        <div class="radio-group">
          <RadioOption
            :model-value="form.mode || ''"
            value="common"
            name="Commun"
            description="Même objectif pour tous"
            icon="👥📋"
            :disabled="!currentConfig.groupModes.includes('common')"
            @update:model-value="form.mode = ($event as ModeType)"
          />
          <RadioOption
            :model-value="form.mode || ''"
            value="collective"
            name="Collectif"
            description="Contributions vers objectif commun"
            icon="👥💰"
            :disabled="!currentConfig.groupModes.includes('collective')"
            @update:model-value="form.mode = ($event as ModeType)"
          />
        </div>
        
        <!-- Info explicative selon la catégorie -->
        <InfoBox 
          v-if="form.category === CATEGORIES.FITNESS"
          variant="info"
          icon="💪"
          message="Les défis Fitness en groupe utilisent toujours le mode Commun (même objectif pour tous)"
        />
        
        <InfoBox 
          v-if="form.category === CATEGORIES.FINANCE"
          variant="info"
          icon="💰"
          message="Les défis Finance en groupe utilisent toujours le mode Collectif (contributions personnalisées)"
        />
      </div>

      <!-- Section Visibilité : seulement si Group -->
      <div v-if="form.type === 'group'" class="form-section">
        <label class="form-label">Qui peut rejoindre ?</label>
        <div class="visibility-options">
          <VisibilityOption
            v-model="form.visibility"
            value="public_open"
            name="Ouvert à tous"
            icon="🌍"
          />
          <VisibilityOption
            v-model="form.visibility"
            value="public_invite"
            name="Sur invitation"
            icon="🔒"
          />
        </div>
      </div>

      <InfoBox 
        v-if="form.type === 'group'"
        variant="success"
        icon="🔗"
        message="Un code d'invitation sera généré automatiquement pour partager ce défi"
      />

      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$router.back()">
          Annuler
        </button>
        <button type="submit" class="btn btn-primary" :disabled="!isFormValid">
          ➕ Créer le défi
        </button>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { challengeTypes, CATEGORIES, TYPES, MODES, VISIBILITIES } from '~/config/challengeType'
import type { CategoryType, ChallengeType, ModeType, VisibilityType } from '~/config/challengeType'

interface ApiResponse {
  success: boolean
  invite_code?: string
  message?: string
}

const form = ref<{
  category: CategoryType
  title: string
  description: string
  targetValue: number | null
  unit: string
  endDate: string
  type: ChallengeType
  mode: ModeType | null
  visibility: VisibilityType
}>({
  category: CATEGORIES.FITNESS,
  title: '',
  description: '',
  targetValue: null,
  unit: 'heures', 
  endDate: '',
  type: TYPES.INDIVIDUAL,
  mode: null,
  visibility: VISIBILITIES.PUBLIC_OPEN
})

const currentConfig = computed(() => 
  challengeTypes.find(type => type.id === form.value.category) || challengeTypes[0]
)

const isFormValid = computed(() => {
  const baseValid = form.value.title.trim() && 
                   form.value.targetValue !== null && 
                   form.value.targetValue > 0 && 
                   form.value.endDate
  
  const unitValid = currentConfig.value?.unit || form.value.unit?.trim()
  return baseValid && unitValid
})

const selectCategory = (categoryId: CategoryType) => {
  const config = challengeTypes.find(type => type.id === categoryId)
  if (!config) return
  
  form.value.category = categoryId
  form.value.unit = config.unit || ''
  
  if (!config.types.includes(form.value.type)) {
    form.value.type = config.types[0] as ChallengeType
  }
  
  if (form.value.type === TYPES.GROUP) {
    form.value.mode = config.groupModes[0] as ModeType
  } else {
    form.value.mode = null
  }
}

watch(() => form.value.type, (newType) => {
  if (newType === TYPES.INDIVIDUAL) {
    form.value.mode = null
    form.value.visibility = VISIBILITIES.PRIVATE
  } else {
    const config = currentConfig.value
    if (config) {
      form.value.mode = config.groupModes[0] as ModeType
      form.value.visibility = VISIBILITIES.PUBLIC_OPEN
    }
  }
})

const handleSubmit = async () => {
  if (!isFormValid.value || form.value.targetValue === null) return
  
  try {
    const config = currentConfig.value
    if (!config) return
    
    const apiData = {
      category: form.value.category,
      title: form.value.title,
      description: form.value.description,
      target_value: form.value.targetValue,
      unit: form.value.unit || config.unit,
      end_date: form.value.endDate,
      type: form.value.type,
      mode: form.value.mode,
      visibility: form.value.visibility
    }
    
    console.log('🚀 Données envoyées:', apiData)
    
    const response = await $fetch<ApiResponse>('/api/challenge', {
      method: 'POST',
      body: apiData
    })
    
    if (response.success) {
      if (response.invite_code) {
        alert(`Défi créé ! 🎉\n\nCode d'invitation : ${response.invite_code}`)
      } else {
        alert('Défi personnel créé avec succès ! 🎯')
      }
      
      await navigateTo('/dashboard')
    }
    
  } catch (error: any) {
    console.error('❌ Erreur création défi:', error)
    alert(`Erreur: ${error.data?.statusMessage || 'Erreur lors de la création du défi'}`)
  }
}

const getTodayDate = () => new Date().toISOString().split('T')[0]

onMounted(() => {
  const config = currentConfig.value
  if (config) {
    form.value.type = config.types[0] as ChallengeType
    if (form.value.type === TYPES.GROUP) {
      form.value.mode = config.groupModes[0] as ModeType
    }
  }
})

useHead({
  title: 'Créer un défi - Broodl',
  meta: [
    { name: 'description', content: 'Créez votre nouveau défi collaboratif' }
  ]
})
</script>

<style scoped>
.create-page {
  padding: var(--space-lg);
  padding-bottom: calc(var(--safe-bottom) + var(--space-2xl));
  max-width: 600px;
  margin: 0 auto;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-2xl);
}

.back-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: var(--text-base);
  cursor: pointer;
  font-family: inherit;
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0;
}

/* Formulaire */
.create-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.form-label {
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

/* Inputs de base */
.form-input,
.form-textarea {
  width: 100%;
  padding: var(--space-lg);
  background: var(--bg-glass);
  backdrop-filter: var(--blur-xl);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-base);
  font-family: inherit;
  min-height: var(--touch-target);
  transition: var(--transition-fast);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  background: var(--bg-card);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Types de défis */
.challenge-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.type-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition-fast);
  min-height: var(--touch-target);
}

.type-btn.active {
  background: var(--gradient-primary);
  color: var(--text-primary);
  border-color: transparent;
}

.type-icon {
  font-size: var(--text-xl);
}

.type-name {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  text-align: center;
}

/* Objectif */
.objective-inputs {
  display: flex;
  gap: var(--space-lg);
}

.objective-value {
  flex: 2;
}

.objective-unit {
  flex: 1;
}

.unit-fixed {
  background: var(--bg-glass) !important;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  cursor: not-allowed;
}

/* Groupes radio et visibilité */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.visibility-options {
  display: flex;
  gap: var(--space-lg);
}

/* Actions */
.form-actions {
  display: flex;
  gap: var(--space-lg);
  margin-top: var(--space-xl);
}

.form-actions .btn {
  flex: 1;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 480px) {
  .challenge-types {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .visibility-options {
    flex-direction: column;
  }
  
  .objective-inputs {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>