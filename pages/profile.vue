<template>
  <div class="page-container">
    <header class="page-header">
      <button class="btn btn-secondary back-btn" @click="$router.back()">
        ← Retour
      </button>
      <h1 class="page-title text-gradient">Mon profil</h1>
    </header>

    <!-- État de chargement -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement de votre profil...</p>
    </div>

    <!-- État d'erreur -->
    <div v-else-if="error" class="error-state card text-center">
      <div class="error-icon">⚠️</div>
      <h3>Erreur de chargement</h3>
      <p class="text-muted">{{ error }}</p>
      <button class="btn btn-primary" @click="loadProfile">
        🔄 Réessayer
      </button>
    </div>

    <!-- Contenu principal -->
    <div v-else-if="user" class="profile-content">
      
      <!-- Carte profil utilisateur -->
      <section class="card profile-card">
        <div class="profile-header">
          <div class="avatar-container">
            <img 
              :src="user.avatar || defaultAvatar" 
              :alt="user.name"
              class="profile-avatar"
              @error="handleAvatarError"
            >
            <button class="avatar-edit-btn" @click="handleEditAvatar">
              ✏️
            </button>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ user.firstname }} {{ user.lastname }}</h2>
            <p class="profile-username text-muted">@{{ user.username }}</p>
            <p class="profile-email text-secondary">{{ user.email }}</p>
          </div>
        </div>
      </section>

      <!-- Statistiques -->
      <section class="card stats-card">
        <h3 class="section-title">Mes statistiques</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value text-gradient">{{ stats.totalChallenges }}</div>
            <div class="stat-label">Défis rejoints</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-gradient">{{ stats.completedChallenges }}</div>
            <div class="stat-label">Défis réussis</div>
          </div>
          <div class="stat-item">
            <div class="stat-value text-gradient">{{ stats.createdChallenges }}</div>
            <div class="stat-label">Défis créés</div>
          </div>
        </div>
      </section>

      <!-- Actions rapides -->
      <section class="card actions-card">
        <h3 class="section-title">Actions rapides</h3>
        <div class="actions-grid">
          <button class="action-btn" @click="handleEditProfile">
            ✏️ Modifier le profil
          </button>
          <button class="action-btn" @click="handleChangePassword">
            🔒 Changer le mot de passe
          </button>
          <button class="action-btn" @click="handleNotifications">
            🔔 Notifications
          </button>
          <button class="action-btn" @click="handlePrivacy">
            🛡️ Confidentialité
          </button>
        </div>
      </section>

      <!-- Zone dangereuse -->
      <section class="card danger-card">
        <h3 class="section-title text-error">Zone de danger</h3>
        <div class="danger-actions">
          <button class="btn btn-secondary" @click="handleLogout">
            🚪 Se déconnecter
          </button>
          <button class="btn btn-error" @click="handleDeleteAccount">
            🗑️ Supprimer le compte
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// Définir la meta pour cette page
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const router = useRouter()

// État local
const loading = ref(true)
const error = ref(null)
const user = ref(null)

// Données mockées pour les stats (remplacer par de vraies données)
const stats = computed(() => ({
  totalChallenges: 12,
  completedChallenges: 8,
  createdChallenges: 3
}))

const defaultAvatar = computed(() => 
  `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.firstname || 'User')}&background=a855f7&color=fff&size=200`
)

// Composables
const { handleAvatarError } = useUtils()

// Charger les données utilisateur
const loadProfile = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $fetch('/api/auth/me')
    user.value = response.user
    
  } catch (err) {
    console.error('Erreur chargement profil:', err)
    error.value = 'Impossible de charger votre profil'
  } finally {
    loading.value = false
  }
}

// Handlers (fonctions basiques pour un projet bachelor)
const handleEditAvatar = () => {
  alert('Fonctionnalité à développer : Modifier l\'avatar')
}

const handleEditProfile = () => {
  alert('Fonctionnalité à développer : Modifier le profil')
}

const handleChangePassword = () => {
  alert('Fonctionnalité à développer : Changer le mot de passe')
}

const handleNotifications = () => {
  alert('Fonctionnalité à développer : Paramètres de notifications')
}

const handlePrivacy = () => {
  alert('Fonctionnalité à développer : Paramètres de confidentialité')
}

const handleLogout = async () => {
  if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
    try {
      // Supprimer le token et rediriger
      const cookie = useCookie('accessToken')
      cookie.value = null
      
      await router.push('/auth/login')
    } catch (err) {
      console.error('Erreur déconnexion:', err)
    }
  }
}

const handleDeleteAccount = () => {
  alert('⚠️ Fonctionnalité sensible à développer avec précaution')
}

onMounted(() => {
  loadProfile()
})

// Meta données
useHead({
  title: 'Mon profil - Broodl',
  meta: [
    { name: 'description', content: 'Gérez votre profil utilisateur sur Broodl' }
  ]
})
</script>

<style scoped>
/* États de chargement */
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

.error-icon {
  font-size: var(--text-4xl);
  margin-bottom: var(--space-lg);
}

/* Profil principal */
.profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-2xl);
}

.avatar-container {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 3px solid var(--color-primary);
  object-fit: cover;
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--gradient-primary);
  border: 2px solid var(--bg-card);
  color: white;
  font-size: var(--text-sm);
  cursor: pointer;
  transition: var(--transition-bounce);
}

.avatar-edit-btn:hover {
  transform: scale(1.1);
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-sm) 0;
}

.profile-username {
  font-size: var(--text-lg);
  margin: 0 0 var(--space-xs) 0;
}

.profile-email {
  font-size: var(--text-base);
  margin: 0;
}

/* Statistiques */
.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0 0 var(--space-xl) 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xl);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-sm);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Actions */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.action-btn {
  padding: var(--space-xl);
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-bounce);
  font-size: var(--text-sm);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* Zone de danger */
.danger-card {
  border-color: rgba(239, 68, 68, 0.3);
}

.text-error {
  color: var(--color-error);
}

.danger-actions {
  display: flex;
  gap: var(--space-lg);
  flex-wrap: wrap;
}

.btn-error {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-error:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* Responsive */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-xl);
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .danger-actions {
    flex-direction: column;
  }
}
</style>