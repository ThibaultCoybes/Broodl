<template>
  <div class="page-container">
    <header class="page-header">
      <div class="header-top">
        <button class="btn btn-secondary back-btn" @click="$router.back()">
          ← Retour
        </button>
        <h1 class="page-title text-gradient">Mes défis</h1>
      </div>
      
      <div class="search-container">
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="🔍 Rechercher un défi..."
          class="form-input"
        >
      </div>
    </header>

    <nav class="tabs-nav">
      <button 
        v-for="tab in tabsWithCounts" 
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
        <span class="badge badge-primary">{{ tab.count }}</span>
      </button>
    </nav>

    <main class="challenges-content">
      <!-- État de chargement -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement de vos défis...</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="error" class="error-state card text-center">
        <div class="error-icon">⚠️</div>
        <h3>Oups, une erreur s'est produite</h3>
        <p class="text-muted">{{ error }}</p>
        <button class="btn btn-primary" @click="loadChallenges">
          🔄 Réessayer
        </button>
      </div>

      <!-- État vide -->
      <div v-else-if="filteredChallenges.length === 0" class="empty-state">
        <div class="empty-icon">{{ getEmptyIcon() }}</div>
        <h3>{{ getEmptyTitle() }}</h3>
        <p class="text-secondary">{{ getEmptyMessage() }}</p>
        <button class="btn btn-primary" @click="handleCreateChallenge">
          ➕ Créer mon premier défi
        </button>
      </div>

      <!-- Liste des défis -->
      <div v-else class="challenges-list list-container">
        <div 
          v-for="challenge in filteredChallenges" 
          :key="challenge.id"
          class="challenge-card card"
          @click="handleChallengeClick(challenge.id)"
        >
          <div v-if="challenge.isCreator" class="creator-badge badge badge-warning">
            👑 Organisateur
          </div>

          <div class="card-header">
            <div class="challenge-type">
              <span class="challenge-icon">{{ challenge.icon }}</span>
              <span class="challenge-category text-muted">{{ challenge.category }}</span>
            </div>
            <div class="challenge-status badge" :class="`badge-${getStatusVariant(challenge.status)}`">
              <span class="status-dot" :class="challenge.status"/>
              {{ getStatusText(challenge.status) }}
            </div>
          </div>

          <div class="card-content">
            <h3 class="challenge-title">{{ challenge.title }}</h3>
            <p class="challenge-description text-secondary">{{ challenge.description }}</p>
          </div>

          <div class="participants-section">
            <div class="participants-avatars">
              <img 
                v-for="participant in challenge.participants.slice(0, 4)" 
                :key="participant.id"
                :src="participant.avatar" 
                :alt="participant.name"
                class="participant-avatar"
                :title="participant.name"
                @error="handleAvatarError"
              >
              <div v-if="challenge.participants.length > 4" class="more-participants">
                +{{ challenge.participants.length - 4 }}
              </div>
            </div>
            <span class="participants-count text-secondary">
              {{ challenge.participants.length }} participant{{ challenge.participants.length > 1 ? 's' : '' }}
            </span>
          </div>

          <!-- Progression -->
          <div class="progress-section">
            <div class="progress-header">
              <span class="progress-label text-secondary">
                {{ challenge.isCreator ? 'Progression globale' : 'Ma progression' }}
              </span>
              <span class="progress-percentage font-bold">{{ challenge.progress }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: challenge.progress + '%' }"/>
            </div>
            <div class="progress-details">
              <span class="current-value font-bold">{{ challenge.currentValue }} {{ challenge.unit }}</span>
              <span class="target-value text-secondary">/ {{ challenge.targetValue }} {{ challenge.unit }}</span>
            </div>
          </div>

          <!-- Meta informations -->
          <div class="card-meta">
            <div class="meta-item">
              <span class="meta-icon">📅</span>
              <span class="meta-text text-muted">{{ formatEndDate(challenge.endDate) }}</span>
            </div>
            <div v-if="challenge.streak" class="meta-item">
              <span class="meta-icon">🔥</span>
              <span class="meta-text text-muted">{{ challenge.streak }}j de suite</span>
            </div>
            <div v-if="challenge.lastActivity" class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span class="meta-text text-muted">{{ formatLastActivity(challenge.lastActivity) }}</span>
            </div>
          </div>

          <!-- Actions rapides -->
          <div class="card-actions">
            <button 
              class="btn btn-primary btn-small"
              @click.stop="handleUpdateProgress(challenge.id)"
            >
              📈 Mettre à jour
            </button>
            <button 
              v-if="challenge.isCreator"
              class="btn btn-secondary btn-small"
              @click.stop="handleManageChallenge(challenge.id)"
            >
              ⚙️ Gérer
            </button>
            <button 
              v-else
              class="btn btn-secondary btn-small" 
              @click.stop="handleViewDetails(challenge.id)"
            >
              👁️ Détails
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- FAB Créer un défi -->
    <button class="fab" @click="handleCreateChallenge">
      ➕
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Composable pour les défis
const { challenges, loading, error, fetchUserChallenges } = useChallenges()

// État local de la page
const activeTab = ref('active')
const searchQuery = ref('')

// Configuration des onglets avec compteurs calculés
const tabsWithCounts = computed(() => [
  { 
    id: 'active', 
    icon: '🎯', 
    label: 'Actifs', 
    count: challenges.value.filter(c => c.type === 'active').length 
  },
  { 
    id: 'organized', 
    icon: '👑', 
    label: 'Organisés', 
    count: challenges.value.filter(c => c.type === 'organized').length 
  },
  { 
    id: 'completed', 
    icon: '✅', 
    label: 'Terminés', 
    count: challenges.value.filter(c => c.type === 'completed').length 
  }
])

// Computed pour filtrer les défis
const filteredChallenges = computed(() => {
  // Si pas encore chargé, retourner tableau vide
  if (loading.value) return []
  
  const query = searchQuery.value.toLowerCase()
  
  let filtered = [...challenges.value].filter(challenge => 
    challenge.type === activeTab.value
  )
  
  if (query) {
    filtered = filtered.filter(challenge => 
      challenge.title.toLowerCase().includes(query) ||
      challenge.description.toLowerCase().includes(query) ||
      challenge.category.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

// Charger les défis une seule fois au montage
onMounted(() => {
  // Ne charger que si pas déjà chargé et pas en cours de chargement
  if (challenges.value.length === 0 && !loading.value) {
    fetchUserChallenges().catch(err => {
      console.error('Erreur lors du chargement des défis:', err)
    })
  }
})

// Handlers
const handleChallengeClick = (id) => {
  router.push(`/challenge/${id}`)
}

const handleCreateChallenge = () => {
  router.push('/challenge/create')
}

const handleUpdateProgress = (id) => {
  console.log(`Mettre à jour la progression du défi ${id}`)
  // TODO: Modal ou navigation vers page de mise à jour
}

const handleManageChallenge = (id) => {
  console.log(`Gérer le défi ${id}`)
  // TODO: Navigation vers page de gestion
}

const handleViewDetails = (id) => {
  router.push(`/challenge/${id}`)
}

// Utiliser le composable centralisé
const { handleAvatarError } = useUtils()

// Fonctions utilitaires
const getStatusText = (status) => {
  const statusMap = {
    'active': 'Actif',
    'ending_soon': 'Bientôt fini',
    'completed': 'Terminé',
    'paused': 'En pause'
  }
  return statusMap[status] || status
}

const getStatusVariant = (status) => {
  const variantMap = {
    'active': 'success',
    'ending_soon': 'warning',
    'completed': 'primary',
    'paused': 'secondary'
  }
  return variantMap[status] || 'primary'
}

const getEmptyIcon = () => {
  const iconMap = {
    'active': '🎯',
    'organized': '👑',
    'completed': '🏆'
  }
  return iconMap[activeTab.value] || '🎯'
}

const getEmptyTitle = () => {
  const titleMap = {
    'active': 'Aucun défi actif',
    'organized': 'Aucun défi organisé',
    'completed': 'Aucun défi terminé'
  }
  return titleMap[activeTab.value] || 'Aucun défi'
}

const getEmptyMessage = () => {
  const messageMap = {
    'active': 'Rejoignez un défi existant ou créez le vôtre pour commencer !',
    'organized': 'Créez votre premier défi et invitez vos amis à vous rejoindre.',
    'completed': 'Vos défis réussis apparaîtront ici. Continuez comme ça !'
  }
  return messageMap[activeTab.value] || ''
}

// Utiliser les fonctions centralisées du composable
const { formatEndDate, formatTimeAgo } = useDateFormatting()
const formatLastActivity = formatTimeAgo

useHead({
  title: 'Mes défis - Broodl',
  meta: [
    { name: 'description', content: 'Gérez tous vos défis collaboratifs' }
  ]
})
</script>

<style scoped>
/* Header */
.header-top {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0;
}

/* Tabs */
.tabs-nav {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-xl);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: var(--space-xs);
}

.tabs-nav::-webkit-scrollbar {
  display: none;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg) var(--space-xl);
  background: var(--bg-glass);
  backdrop-filter: var(--blur-xl);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition-bounce);
  flex-shrink: 0;
  min-height: var(--touch-target);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: var(--text-primary);
  border-color: transparent;
  box-shadow: var(--shadow-primary);
}

.tab-icon {
  font-size: var(--text-base);
}

/* States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-4xl) var(--space-lg);
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(168, 85, 247, 0.3);
  border-top: 3px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-xl);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-lg);
}

.error-state h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-primary);
}

.error-state p {
  margin: 0 0 var(--space-2xl) 0;
}

.empty-state {
  text-align: center;
  padding: var(--space-4xl) var(--space-lg);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-xl);
  opacity: 0.5;
}

.empty-state h3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-lg) 0;
  color: var(--text-primary);
}

.empty-state p {
  margin: 0 0 var(--space-2xl) 0;
  line-height: 1.5;
}

/* Challenge cards */
.challenge-card {
  cursor: pointer;
  position: relative;
  transition: var(--transition-bounce);
}

.challenge-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.challenge-card:active {
  transform: scale(0.98);
}

.creator-badge {
  position: absolute;
  top: var(--space-lg);
  right: var(--space-lg);
  z-index: 1;
  font-size: var(--text-xs);
  padding: var(--space-xs) var(--space-sm);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-lg);
}

.challenge-type {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.challenge-icon {
  font-size: var(--text-xl);
}

.challenge-category {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-medium);
}

.challenge-status {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-content {
  margin-bottom: var(--space-xl);
}

.challenge-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-sm) 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.challenge-description {
  margin: 0;
  font-size: var(--text-sm);
  line-height: 1.5;
}

/* Participants */
.participants-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.participants-avatars {
  display: flex;
  align-items: center;
}

.participant-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--bg-card);
  object-fit: cover;
  margin-left: -8px;
}

.participant-avatar:first-child {
  margin-left: 0;
}

.more-participants {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  color: white;
  margin-left: -8px;
}

.participants-count {
  font-size: var(--text-sm);
}

/* Progress */
.progress-section {
  margin-bottom: var(--space-xl);
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.progress-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-medium);
}

.progress-percentage {
  font-size: var(--text-sm);
  color: var(--text-primary);
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: var(--space-sm);
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
}

.current-value {
  font-size: var(--text-lg);
  color: var(--text-primary);
}

.target-value {
  font-size: var(--text-sm);
}

/* Meta */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.meta-icon {
  font-size: var(--text-sm);
}

.meta-text {
  font-size: var(--text-xs);
}

/* Actions */
.card-actions {
  display: flex;
  gap: var(--space-sm);
}

.card-actions .btn {
  flex: 1;
}

/* FAB */
.fab {
  position: fixed;
  bottom: calc(80px + var(--safe-bottom) + var(--space-lg));
  right: var(--space-lg);
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient-primary);
  color: var(--text-primary);
  border: none;
  font-size: var(--text-xl);
  box-shadow: var(--shadow-primary);
  cursor: pointer;
  transition: var(--transition-bounce);
  z-index: 100;
}

.fab:active {
  transform: scale(0.95);
}

/* Responsive */
@media (max-width: 480px) {
  .header-top {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-md);
  }
  
  .card-meta {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .card-actions {
    flex-direction: column;
  }
}

@media (min-width: 768px) {
  .challenges-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--component-item-gap);
  }
  
  .fab {
    bottom: calc(var(--safe-bottom) + var(--space-lg));
  }
}

/* Animation */
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.challenge-card {
  animation: slideInUp 0.3s ease forwards;
}

.challenge-card:nth-child(1) { animation-delay: 0.1s; }
.challenge-card:nth-child(2) { animation-delay: 0.2s; }
.challenge-card:nth-child(3) { animation-delay: 0.3s; }
</style>