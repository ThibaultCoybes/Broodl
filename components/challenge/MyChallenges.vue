<template>
  <div class="my-challenges">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement de vos défis...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="loadMyChallenges">
        🔄 Réessayer
      </button>
    </div>

    <div v-else-if="challenges.length === 0" class="empty-state">
      <div class="empty-icon">👤</div>
      <h3>Aucun défi personnel</h3>
      <p>Vous n'avez pas encore rejoint ou créé de défi</p>
      <div class="empty-actions">
        <button class="btn btn-primary" @click="createChallenge">
          ➕ Créer un défi
        </button>
        <button class="btn btn-secondary" @click="explorePublic">
          🌍 Explorer les défis publics
        </button>
      </div>
    </div>

    <div v-else class="challenges-list">
      <div 
        v-for="challenge in challenges" 
        :key="challenge.id"
        class="my-challenge-card"
        @click="viewChallenge(challenge.id)"
      >
        <div class="challenge-header">
          <div class="challenge-type">
            <span class="challenge-icon">{{ challenge.icon || '🎯' }}</span>
            <span class="challenge-category">{{ challenge.category }}</span>
          </div>
          <div class="challenge-status" :class="challenge.status">
            {{ getStatusText(challenge.status) }}
          </div>
        </div>

        <div class="challenge-content">
          <h3 class="challenge-title">{{ challenge.title }}</h3>
          <p class="challenge-description">{{ challenge.description }}</p>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Ma progression</span>
            <span class="progress-percentage">{{ challenge.progress || 0 }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (challenge.progress || 0) + '%' }"></div>
          </div>
          <div class="progress-details">
            <span class="current-value">{{ challenge.currentValue || 0 }} {{ challenge.unit }}</span>
            <span class="target-value">/ {{ challenge.targetValue }} {{ challenge.unit }}</span>
          </div>
        </div>

        <div class="challenge-meta">
          <div class="meta-item">
            <span class="meta-icon">👥</span>
            <span class="meta-text">{{ challenge.participants?.length || 0 }} participants</span>
          </div>
          <div class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">{{ formatEndDate(challenge.endDate) }}</span>
          </div>
          <div v-if="challenge.streak" class="meta-item">
            <span class="meta-icon">🔥</span>
            <span class="meta-text">{{ challenge.streak }}j de suite</span>
          </div>
        </div>

        <div class="challenge-actions">
          <button 
            class="btn btn-primary btn-small"
            @click.stop="updateProgress(challenge.id)"
          >
            📈 Mettre à jour
          </button>
          <button 
            class="btn btn-secondary btn-small"
            @click.stop="viewChallenge(challenge.id)"
          >
            👁️ Détails
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useChallenges } from '~/composables/useChallenges'

const router = useRouter()

// ✅ CORRECT : Utilisation du composable complet
// Le composable gère déjà l'état réactif (challenges, loading, error)
const { challenges, loading, error, fetchUserChallenges } = useChallenges()

const loadMyChallenges = async () => {
  try {
    // ✅ CORRECT : Appel direct de la fonction du composable
    // Le composable gère automatiquement loading et error
    await fetchUserChallenges()
  } catch (err) {
    console.error('Erreur lors du chargement des défis:', err)
  }
}

const updateProgress = (challengeId) => {
  console.log('Mettre à jour la progression du défi', challengeId)
}

const viewChallenge = (challengeId) => {
  router.push(`/challenge/${challengeId}`)
}

const createChallenge = () => {
  router.push('/challenge/create')
}

const explorePublic = () => {
  router.push('/challenge')
}

const getStatusText = (status) => {
  const statusMap = {
    'active': 'Actif',
    'ending_soon': 'Bientôt fini',
    'completed': 'Terminé',
    'paused': 'En pause'
  }
  return statusMap[status] || status
}

const formatEndDate = (date) => {
  if (!date) return 'Pas de limite'
  return new Date(date).toLocaleDateString('fr-FR')
}

// Charger les défis au montage du composant
onMounted(() => {
  loadMyChallenges()
})
</script>

<style scoped>
.my-challenges {
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid #334155;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.6;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.challenges-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.my-challenge-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.my-challenge-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
  border-color: var(--border-hover);
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.challenge-type {
  display: flex;
  align-items: center;
  gap: 12px;
}

.challenge-icon {
  font-size: 20px;
}

.challenge-category {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.challenge-status {
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.challenge-status.active {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.challenge-status.ending_soon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.challenge-status.completed {
  background: rgba(6, 182, 212, 0.1);
  color: #06b6d4;
}

.challenge-status.paused {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.challenge-content {
  margin-bottom: 24px;
}

.challenge-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.challenge-description {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.progress-section {
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.progress-label {
  font-size: 12px;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 500;
}

.progress-percentage {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  transition: width 0.3s ease;
}

.progress-details {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-value {
  font-size: 18px;
  color: var(--text-primary);
  font-weight: 600;
}

.target-value {
  font-size: 14px;
  color: var(--text-secondary);
}

.challenge-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-icon {
  font-size: 14px;
  opacity: 0.7;
}

.meta-text {
  font-size: 12px;
  color: var(--text-muted);
}

.challenge-actions {
  display: flex;
  gap: 12px;
}

.challenge-actions .btn {
  flex: 1;
}

@media (max-width: 768px) {
  .empty-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .challenge-meta {
    flex-direction: column;
    gap: 12px;
  }
  
  .challenge-actions {
    flex-direction: column;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>