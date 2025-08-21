<template>
  <div class="page-container">
    <div v-if="pending" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Chargement du défi...</p>
    </div>

    <div v-else-if="error" class="error-container card">
      <h2>❌ Erreur</h2>
      <p>{{ getErrorMessage() }}</p>
      <button class="btn btn-primary" @click="refresh()">Réessayer</button>
    </div>

    <div v-else-if="challenge" class="flex flex-col gap-3xl">
      <header class="detail-header">
        <button class="btn btn-secondary back-btn" @click="$router.back()">
          ← Retour
        </button>
        <div class="header-actions">
          <button v-if="challenge.isCreator" class="action-btn" @click="handleManage">
            ⚙️
          </button>
          <button class="action-btn" @click="handleShare">
            📤
          </button>
        </div>
      </header>

      <section class="challenge-hero card">
        <div class="challenge-type">
          <span class="challenge-icon">{{ challenge.icon }}</span>
          <span class="challenge-category">{{ challenge.category }}</span>
          <span class="challenge-mode">{{ getModeLabel() }}</span>
        </div>
        <h1 class="challenge-title text-gradient">{{ challenge.title }}</h1>
        <p class="challenge-description">{{ challenge.description }}</p>
        
        <div class="challenge-status badge" :class="`badge-${challenge.status === 'active' ? 'success' : 'primary'}`">
          <span class="status-dot" :class="challenge.status"/>
          {{ getStatusText(challenge.status) }}
          <span>• {{ formatTimeRemaining(challenge.endDate) }}</span>
        </div>
      </section>

      <!-- Progression personnelle -->
      <section class="card">
        <div class="progress-section">
          <h3 class="progress-title">{{ getProgressTitle() }}</h3>
          
          <!-- Progression individuelle (Individual + Common) -->
          <div v-if="challenge.mode !== 'collective'" class="personal-progress">
            <div class="progress-display">
              <span class="values">{{ myProgress.current }}/{{ myProgress.target }} {{ challenge.unit }}</span>
              <span class="percentage" :class="{ completed: myProgress.percentage >= 100 }">
                ({{ myProgress.percentage }}%)
              </span>
              <span v-if="myProgress.status === 'completed'" class="status-badge completed">✅ Terminé</span>
            </div>
            <div class="progress-bar">
              <div class="fill" :style="{ width: Math.min(myProgress.percentage, 100) + '%' }"></div>
              <div v-if="myProgress.percentage > 100" class="overflow-fill" 
                   :style="{ width: Math.min(myProgress.percentage - 100, 50) + '%' }"></div>
            </div>
          </div>

          <!-- Progression collective -->
          <div v-else class="collective-progress">
            <div class="my-contribution">
              <h4>Ma contribution</h4>
              <div class="contribution-display">
                <span class="contribution-value">{{ myProgress.current }} {{ challenge.unit }}</span>
              </div>
            </div>
            <div class="global-progress">
              <h4>Progression collective</h4>
              <div class="progress-display">
                <span class="values">{{ globalProgress.total }}/{{ challenge.targetValue }} {{ challenge.unit }}</span>
                <span class="percentage">({{ globalProgress.percentage }}%)</span>
              </div>
              <div class="progress-bar">
                <div class="fill" :style="{ width: Math.min(globalProgress.percentage, 100) + '%' }"></div>
                <div v-if="globalProgress.percentage > 100" class="overflow-fill" 
                     :style="{ width: Math.min(globalProgress.percentage - 100, 50) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <button 
          class="btn btn-primary w-full mt-xl" 
          @click="handleUpdateProgress"
          :disabled="updating"
        >
          {{ updating ? '⏳ Mise à jour...' : getUpdateButtonLabel() }}
        </button>
      </section>

      <!-- Participants -->
      <section class="card">
        <div class="section-header">
          <h2>Participants ({{ challenge.participants.length }})</h2>
          <button v-if="challenge.isCreator" class="btn btn-primary btn-small" @click="handleInvite">
            ➕ Inviter
          </button>
        </div>
        
        <div class="list-container">
          <ListItem 
            v-for="participant in challenge.participants" 
            :key="participant.id"
            :title="participant.name"
            :subtitle="getParticipantSubtitle(participant)"
          >
            <template #avatar>
              <UserAvatar 
                :name="participant.name" 
                :avatar-url="participant.avatar" 
              />
            </template>
            
            <template #badges>
              <span v-if="participant.isCreator || participant.role === 'creator'" class="creator-badge">👑</span>
              <span v-if="participant.status === 'completed'" class="completed-badge">✅</span>
            </template>
            
            <template #actions>
              <div class="participant-stats">
                <div v-if="challenge.mode !== 'collective'" class="participant-percentage">
                  {{ getParticipantProgress(participant) }}%
                </div>
                <div v-else class="participant-contribution">
                  {{ participant.personal_current || 0 }} {{ challenge.unit }}
                </div>
                <div v-if="participant.streak" class="participant-streak">🔥 {{ participant.streak }}j</div>
              </div>
            </template>
          </ListItem>
        </div>
      </section>

      <!-- Activité récente -->
      <section class="card">
        <div class="section-header">
          <h2>Activité récente</h2>
          <button v-if="recentLogs.length > 0" class="btn btn-secondary btn-small" @click="showAllActivity = !showAllActivity">
            {{ showAllActivity ? 'Réduire' : 'Voir tout' }}
          </button>
        </div>
        
        <div v-if="recentLogs.length > 0" class="list-container">
          <div 
            v-for="(log, index) in displayedLogs" 
            :key="log.id"
            class="activity-item"
          >
            <div class="activity-main">
              <UserAvatar 
                :name="log.user.name" 
                size="sm" 
                class="activity-avatar"
              />
              <div class="activity-content">
                <p class="activity-text">
                  <strong>{{ log.user.name }}</strong> 
                  <span v-if="challenge.mode === 'collective'">
                    a contribué +{{ log.value }} {{ challenge.unit }}
                  </span>
                  <span v-else>
                    {{ log.message }}
                  </span>
                </p>
                <span class="activity-time text-muted">{{ formatTimeAgo(log.createdAt) }}</span>
                <p v-if="log.note" class="activity-note">{{ log.note }}</p>
              </div>
              <div class="activity-actions">
                <div class="badge badge-success">
                  +{{ log.value }}
                </div>
                <button 
                  v-if="canDeleteLog(log, index)" 
                  @click="deleteProgressLog(log.id)"
                  class="delete-btn"
                  title="Supprimer cette progression"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="empty-state">
          <p>Aucune activité pour le moment</p>
          <p class="text-muted">Soyez le premier à enregistrer une progression !</p>
        </div>
      </section>

      <!-- Messages du groupe (si créateur) -->
      <section v-if="challenge.isCreator" class="card">
        <div class="section-header">
          <h2>Messages du groupe</h2>
        </div>
        
        <div class="chat-messages">
          <div 
            v-for="message in mockMessages" 
            :key="message.id"
            class="chat-message"
          >
            <UserAvatar 
              :name="message.user.name" 
              size="sm" 
            />
            <div class="message-content">
              <div class="message-header">
                <span class="message-author font-semibold text-primary">{{ message.user.name }}</span>
                <span class="message-time text-muted">{{ formatTimeAgo(message.createdAt) }}</span>
              </div>
              <p class="message-text">{{ message.text }}</p>
            </div>
          </div>
        </div>
        
        <div class="chat-input">
          <input 
            v-model="newMessage"
            type="text" 
            placeholder="Écrivez un message..."
            class="form-input"
            @keyup.enter="sendMessage"
          >
          <button class="send-btn" :disabled="!newMessage.trim()" @click="sendMessage">
            📤
          </button>
        </div>
      </section>

      <!-- Modal mise à jour progression -->
      <div v-if="showUpdateModal" class="modal-overlay" @click="showUpdateModal = false">
        <div class="modal-content card" @click.stop>
          <h3 class="mb-xl">{{ getModalTitle() }}</h3>
          <div class="update-form">
            <div class="form-group">
              <label class="form-label">{{ getInputLabel() }}</label>
              <div class="value-input">
                <input 
                  v-model.number="addedValue"
                  type="number" 
                  :placeholder="getInputPlaceholder()"
                  class="form-input"
                  step="0.01"
                  min="0.01"
                >
                <span class="unit-label">{{ challenge.unit }}</span>
              </div>
              <small class="form-help">{{ getInputHelp() }}</small>
            </div>
            <div class="form-group">
              <label class="form-label">Note (optionnel)</label>
              <textarea 
                v-model="updateNote"
                placeholder="Comment ça s'est passé ?"
                class="form-textarea"
                rows="2"
              />
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" @click="showUpdateModal = false">Annuler</button>
            <button 
              class="btn btn-primary" 
              @click="submitUpdate"
              :disabled="!addedValue || addedValue <= 0 || updating"
            >
              {{ updating ? 'Mise à jour...' : 'Valider' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// État local
const showUpdateModal = ref(false)
const addedValue = ref(null)  // ✅ Changé: valeur AJOUTÉE, pas totale
const updateNote = ref('')
const newMessage = ref('')
const updating = ref(false)
const showAllActivity = ref(false)

// État des données
const challengeData = ref(null)
const recentLogs = ref([])
const pending = ref(true)
const error = ref(null)

// Messages mockés
const mockMessages = ref([
  {
    id: 1,
    user: { name: 'Marie L.' },
    text: 'Salut tout le monde ! Qui est partant pour une sortie ce weekend ?',
    createdAt: new Date(Date.now() - 3600000)
  }
])

// ===== COMPUTED =====

const challenge = computed(() => {
  if (!challengeData.value) return null
  return challengeData.value
})

// ✅ Progression personnelle selon le mode
const myProgress = computed(() => {
  if (!challenge.value) return { current: 0, target: 0, percentage: 0, status: 'active' }
  
  const myParticipation = challenge.value.participants.find(p => p.id === challenge.value.currentUserId)
  if (!myParticipation) return { current: 0, target: 0, percentage: 0, status: 'active' }

  if (challenge.value.mode === 'collective') {
    // Collective: pas de cible individuelle
    return {
      current: myParticipation.personal_current || 0,
      target: null,
      percentage: 0,
      status: 'active'  // Toujours active en collective
    }
  } else {
    // Individual/Common: cible individuelle
    const target = myParticipation.personal_target || challenge.value.targetValue
    const current = myParticipation.personal_current || 0
    const percentage = Math.round((current / target) * 100)
    
    return {
      current,
      target,
      percentage,
      status: myParticipation.status || 'active'
    }
  }
})

// ✅ Progression globale pour le mode collectif
const globalProgress = computed(() => {
  if (!challenge.value || challenge.value.mode !== 'collective') return { total: 0, percentage: 0 }
  
  const total = challenge.value.participants.reduce((sum, p) => sum + (p.personal_current || 0), 0)
  const percentage = Math.round((total / challenge.value.targetValue) * 100)
  
  return { total, percentage }
})

// ✅ Logs d'activité filtrés
const displayedLogs = computed(() => {
  return showAllActivity.value ? recentLogs.value : recentLogs.value.slice(0, 5)
})

// ===== FONCTIONS DE CHARGEMENT =====

const loadChallenge = async () => {
  try {
    pending.value = true
    error.value = null
    
    const response = await $fetch(`/api/challenge/${route.params.id}`)
    
    if (response.success) {
      challengeData.value = response.data
      await loadRecentActivity()
    } else {
      throw new Error(response.message || 'Erreur lors du chargement')
    }
  } catch (err) {
    error.value = err
    console.error('Erreur chargement challenge:', err)
  } finally {
    pending.value = false
  }
}

const loadRecentActivity = async () => {
  try {
    const response = await $fetch(`/api/challenge/${route.params.id}/activity`)
    if (response.success) {
      recentLogs.value = response.data || []
    }
  } catch (err) {
    console.error('Erreur chargement activité:', err)
    recentLogs.value = []
  }
}

const refresh = () => loadChallenge()

onMounted(() => {
  loadChallenge()
})

// ===== HANDLERS =====

const handleUpdateProgress = () => {
  showUpdateModal.value = true
  addedValue.value = null  // Reset
}

const submitUpdate = async () => {
  if (!addedValue.value || addedValue.value <= 0 || updating.value) return
  
  updating.value = true
  try {
    const response = await $fetch(`/api/challenge/${route.params.id}/progress`, {
      method: 'POST',
      body: {
        added_value: addedValue.value,  // ✅ Changé: valeur ajoutée
        note: updateNote.value
      }
    })

    if (response.success) {
      await loadChallenge()  // Recharger tout
      showUpdateModal.value = false
      addedValue.value = null
      updateNote.value = ''
      
      // Notification succès
      if (response.data.status === 'completed') {
        alert('🎉 Félicitations ! Objectif atteint !')
      }
    } else {
      throw new Error(response.message || 'Erreur lors de la mise à jour')
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error)
    alert('Erreur lors de la mise à jour de la progression')
  } finally {
    updating.value = false
  }
}

const deleteProgressLog = async (logId) => {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette progression ?')) return
  
  try {
    const response = await $fetch(`/api/challenge/${route.params.id}/progress/${logId}`, {
      method: 'DELETE'
    })
    
    if (response.success) {
      await loadChallenge()
      alert('Progression supprimée avec succès')
    } else {
      throw new Error(response.message || 'Erreur lors de la suppression')
    }
  } catch (error) {
    console.error('Erreur suppression:', error)
    alert('Erreur lors de la suppression')
  }
}

// ===== AUTRES HANDLERS =====

const handleManage = () => {
  console.log('Gérer le défi')
}

const handleShare = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: challenge.value.title,
        text: challenge.value.description,
        url: window.location.href
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.log('Erreur de partage:', err)
      }
    }
  } else {
    try {
      await navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papier!')
    } catch (err) {
      console.log('Impossible de copier le lien')
    }
  }
}

const handleInvite = () => {
  console.log('Inviter des participants')
}

const sendMessage = () => {
  if (newMessage.value.trim()) {
    mockMessages.value.push({
      id: Date.now(),
      user: { name: 'Moi' },
      text: newMessage.value,
      createdAt: new Date()
    })
    newMessage.value = ''
  }
}

// ===== FONCTIONS UTILITAIRES =====

const getModeLabel = () => {
  const labels = {
    'individual': 'Personnel',
    'common': 'Groupe - Objectif commun', 
    'collective': 'Groupe - Objectif collectif'
  }
  return labels[challenge.value?.mode] || challenge.value?.type || ''
}

const getProgressTitle = () => {
  if (challenge.value?.mode === 'collective') return 'Progression collective'
  return challenge.value?.isCreator ? 'Ma progression' : 'Ma progression'
}

const getUpdateButtonLabel = () => {
  if (challenge.value?.mode === 'collective') return '💰 Contribuer'
  return '📈 Mettre à jour ma progression'
}

const getModalTitle = () => {
  if (challenge.value?.mode === 'collective') return 'Ajouter une contribution'
  return 'Mettre à jour ma progression'
}

const getInputLabel = () => {
  if (challenge.value?.mode === 'collective') return 'Montant à ajouter'
  return 'Valeur à ajouter'
}

const getInputPlaceholder = () => {
  if (challenge.value?.mode === 'collective') return 'Ex: 50'
  return 'Ex: 2'
}

const getInputHelp = () => {
  if (challenge.value?.mode === 'collective') return 'Montant que vous ajoutez au pot commun'
  return 'Valeur qui sera ajoutée à votre progression actuelle'
}

const getParticipantSubtitle = (participant) => {
  if (challenge.value?.mode === 'collective') {
    return `Contribution: ${participant.personal_current || 0} ${challenge.value.unit}`
  } else {
    const target = participant.personal_target || challenge.value?.targetValue
    return `${participant.personal_current || 0}/${target} ${challenge.value?.unit}`
  }
}

const getParticipantProgress = (participant) => {
  if (challenge.value?.mode === 'collective') return 0
  
  const target = participant.personal_target || challenge.value?.targetValue || 1
  const current = participant.personal_current || 0
  return Math.round((current / target) * 100)
}

const canDeleteLog = (log, index) => {
  // Seulement le dernier log de l'utilisateur connecté
  return index === 0 && log.user.id === challenge.value?.currentUserId
}

const getErrorMessage = () => {
  if (!error.value) return 'Erreur inconnue'
  
  const statusCode = error.value.statusCode
  const message = error.value.data?.message || error.value.message
  
  if (statusCode === 401) return 'Vous devez être connecté pour accéder à ce défi'
  if (statusCode === 403) return 'Vous n\'avez pas accès à ce défi'
  if (statusCode === 404) return 'Ce défi n\'existe pas ou a été supprimé'
  
  return message || 'Impossible de charger le défi'
}

const getStatusText = (status) => {
  const statusMap = {
    'active': 'Actif',
    'ending_soon': 'Bientôt fini',
    'completed': 'Terminé',
    'cancelled': 'Annulé'
  }
  return statusMap[status] || status
}

const formatTimeRemaining = (endDate) => {
  if (!endDate) return 'Date non définie'
  
  const now = new Date()
  const end = new Date(endDate)
  const diff = end.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  
  if (days <= 0) return 'Terminé'
  if (days === 1) return 'Se termine demain'
  if (days <= 7) return `${days} jours restants`
  return `${Math.ceil(days / 7)} semaines restantes`
}

const formatTimeAgo = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const past = new Date(date)
  const diff = now.getTime() - past.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(hours / 24)
  
  if (minutes < 60) return `${minutes}min`
  if (hours < 24) return `${hours}h`
  if (days === 1) return 'Hier'
  if (days <= 30) return `${days}j`
  return new Intl.DateTimeFormat('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  }).format(past)
}

// Meta
useHead({
  title: computed(() => challenge.value ? `${challenge.value.title} - Broodl` : 'Challenge - Broodl'),
  meta: [
    { 
      name: 'description', 
      content: computed(() => challenge.value?.description || 'Défi collaboratif sur Broodl') 
    }
  ]
})
</script>

<style scoped>
/* ===== VARIABLES ET BASE ===== */
.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--space-lg);
}

/* ===== LOADING STATES ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: var(--space-xl);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.1);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  text-align: center;
  border: 2px solid var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
  color: var(--text-muted);
  background: var(--bg-glass);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
}

/* ===== HEADER ===== */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-lg) 0;
}

.header-actions {
  display: flex;
  gap: var(--space-lg);
}

.action-btn {
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: var(--radius-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: var(--text-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-bounce);
}

/* ===== HERO SECTION ===== */
.challenge-hero {
  text-align: center;
  position: relative;
}

.challenge-type {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  flex-wrap: wrap;
}

.challenge-icon {
  font-size: var(--text-3xl);
}

.challenge-category {
  font-size: var(--text-sm);
  color: var(--color-primary);
  text-transform: uppercase;
  font-weight: var(--font-bold);
  padding: var(--space-xs) var(--space-lg);
  background: rgba(168, 85, 247, 0.1);
  border-radius: var(--radius-lg);
}

.challenge-mode {
  font-size: var(--text-xs);
  color: var(--text-muted);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-md);
}

.challenge-title {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-xl) 0;
  line-height: 1.2;
}

.challenge-description {
  font-size: var(--text-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--space-2xl) 0;
  line-height: 1.6;
}

/* ===== PROGRESSION ===== */
.progress-section {
  padding: var(--space-xl);
}

.progress-title {
  margin: 0 0 var(--space-xl) 0;
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
}

.personal-progress, .collective-progress {
  margin-bottom: var(--space-xl);
}

.progress-display {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
}

.values {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
  color: var(--text-primary);
}

.percentage {
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.percentage.completed {
  color: var(--color-success);
}

.status-badge.completed {
  background: var(--color-success);
  color: white;
  padding: var(--space-xs) var(--space-lg);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.progress-bar {
  position: relative;
  height: 12px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-full);
  overflow: visible;
}

.fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
  border-radius: var(--radius-full);
  transition: width 0.3s ease;
}

.overflow-fill {
  position: absolute;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #f59e0b, #dc2626);
  border-radius: 0 var(--radius-full) var(--radius-full) 0;
  left: 100%;
  opacity: 0.8;
}

/* Collective specific */
.my-contribution {
  margin-bottom: var(--space-xl);
  padding: var(--space-lg);
  background: rgba(168, 85, 247, 0.05);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(168, 85, 247, 0.2);
}

.my-contribution h4 {
  margin: 0 0 var(--space-lg) 0;
  font-size: var(--text-lg);
  color: var(--color-primary);
}

.contribution-display {
  text-align: center;
}

.contribution-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
}

.global-progress h4 {
  margin: 0 0 var(--space-lg) 0;
  font-size: var(--text-lg);
}

/* ===== PARTICIPANTS ===== */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.list-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.creator-badge {
  font-size: var(--text-lg);
  padding: var(--space-xs);
  background: rgba(255, 215, 0, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 215, 0, 0.3);
}

.completed-badge {
  font-size: var(--text-sm);
  padding: var(--space-xs);
  background: rgba(16, 185, 129, 0.1);
  border-radius: var(--radius-md);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.participant-stats {
  text-align: right;
}

.participant-percentage, .participant-contribution {
  font-weight: var(--font-bold);
  color: var(--color-primary);
  font-size: var(--text-lg);
}

.participant-streak {
  font-size: var(--text-sm);
  color: var(--text-muted);
  margin-top: var(--space-xs);
}

/* ===== ACTIVITÉ ===== */
.activity-item {
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.activity-main {
  display: flex;
  gap: var(--space-lg);
  align-items: flex-start;
}

.activity-avatar {
  flex-shrink: 0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  margin: 0 0 var(--space-sm) 0;
  line-height: 1.4;
}

.activity-time {
  font-size: var(--text-sm);
}

.activity-note {
  margin: var(--space-sm) 0 0 0;
  font-style: italic;
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.activity-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  align-items: flex-end;
}

.delete-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--color-error);
  padding: var(--space-xs);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--text-sm);
  transition: var(--transition-base);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* ===== CHAT ===== */
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
  max-height: 400px;
  overflow-y: auto;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
}

.chat-message {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
}

.message-time {
  font-size: var(--text-sm);
}

.message-text {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.5;
}

.message-content {
  flex: 1;
}

.chat-input {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-primary);
}

.send-btn {
  width: var(--touch-target);
  height: var(--touch-target);
  border-radius: var(--radius-lg);
  background: var(--gradient-primary);
  border: none;
  color: var(--text-primary);
  font-size: var(--text-lg);
  cursor: pointer;
  transition: var(--transition-bounce);
  box-shadow: var(--shadow-primary);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-xl);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.update-form {
  margin-bottom: var(--space-xl);
}

.form-group {
  margin-bottom: var(--space-xl);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
}

.value-input {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
}

.form-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.unit-label {
  color: var(--color-primary);
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
}

.form-help {
  display: block;
  margin-top: var(--space-sm);
  font-size: var(--text-sm);
  color: var(--text-muted);
  font-style: italic;
}

.form-textarea {
  width: 100%;
  padding: var(--space-lg);
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-primary);
  resize: vertical;
  font-family: inherit;
  color: var(--text-primary);
}

.form-textarea::placeholder {
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: var(--space-xl);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-primary);
}

.modal-actions .btn {
  flex: 1;
}

/* ===== BADGES ===== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.badge-primary {
  background: rgba(168, 85, 247, 0.1);
  color: var(--color-primary);
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.active {
  background: var(--color-success);
}

.status-dot.completed {
  background: var(--color-primary);
}

/* ===== BOUTONS ===== */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-xl);
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  transition: var(--transition-base);
  cursor: pointer;
  border: none;
  text-decoration: none;
}

.btn-primary {
  background: var(--gradient-primary);
  color: white;
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary-hover);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-glass);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
}

.btn-small {
  padding: var(--space-sm) var(--space-lg);
  font-size: var(--text-sm);
}

.w-full {
  width: 100%;
}

/* ===== UTILITAIRES ===== */
.mt-xl {
  margin-top: var(--space-xl);
}

.mb-xl {
  margin-bottom: var(--space-xl);
}

.text-gradient {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.text-muted {
  color: var(--text-muted);
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.gap-3xl {
  gap: var(--space-3xl);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .page-container {
    padding: var(--space-md);
  }
  
  .challenge-title {
    font-size: var(--text-3xl);
  }
  
  .modal-actions {
    flex-direction: column;
    gap: var(--space-lg);
  }
  
  .header-actions {
    gap: var(--space-sm);
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
  }
  
  .challenge-type {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .progress-display {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-sm);
  }
  
  .activity-main {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .activity-actions {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .section-header {
    flex-direction: column;
    gap: var(--space-lg);
    align-items: stretch;
  }
  
  .modal-overlay {
    padding: var(--space-lg);
  }
  
  .value-input {
    flex-direction: column;
    text-align: center;
  }
}
</style>