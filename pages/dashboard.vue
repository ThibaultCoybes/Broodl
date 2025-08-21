<template>
  <div class="page-container">
    <header class="dashboard-header">
      <div class="welcome">
        <h1 class="page-title text-gradient">Salut {{ username }} 👋</h1>
        <p class="welcome-subtitle text-secondary" v-if="!loading && !error">{{ getGreeting() }}</p>
      </div>
      <button class="btn btn-primary" @click="router.push('/challenge/create')">
        ➕ Nouveau défi
      </button>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Chargement de vos défis...</p>
    </div>

    <div v-else-if="error" class="error-state card">
      <div class="error-icon">⚠️</div>
      <h3>Oups, une erreur s'est produite</h3>
      <p class="text-muted">{{ error.message || 'Erreur lors du chargement' }}</p>
      <button @click="fetchData" class="btn btn-secondary">🔄 Réessayer</button>
    </div>

    <template v-else>
      <section class="stats-grid grid-container grid-2">
        <div v-for="stat in stats" :key="stat.id" class="stat-card card text-center">
          <div class="stat-icon">{{ stat.icon }}</div>
          <div class="stat-content">
            <span class="stat-value text-gradient">{{ stat.value }}</span>
            <span class="stat-label text-secondary">{{ stat.label }}</span>
          </div>
        </div>
      </section>

      <section class="priority-challenges">
        <div class="section-header">
          <h2 class="section-title text-gradient-accent">Défis en cours</h2>
          <button class="link-button text-secondary" @click="router.push('/challenge')">
            Voir tout →
          </button>
        </div>
        
        <div v-if="priorityChallenges.length > 0" class="challenges-preview list-container">
          <ChallengeCard
            v-for="challenge in priorityChallenges" 
            :key="challenge.id"
            :challenge="challenge"
            @click="handleChallengeClick"
          />
        </div>
        <div v-else class="empty-state">
          <div class="empty-icon">🎯</div>
          <h3>Aucun défi en cours</h3>
          <p class="text-secondary">Créez votre premier défi pour commencer !</p>
          <button @click="router.push('/challenge/create')" class="btn btn-primary">
            ➕ Créer un défi
          </button>
        </div>
      </section>

      <!-- ✅ Section défis terminés récents -->
      <section v-if="recentCompletedChallenges.length > 0" class="completed-challenges">
        <div class="section-header">
          <h2 class="section-title text-gradient-accent">Récemment terminés</h2>
          <button class="link-button text-secondary" @click="router.push('/challenge?filter=completed')">
            Voir tout →
          </button>
        </div>
        
        <div class="challenges-preview list-container">
          <ChallengeCard
            v-for="challenge in recentCompletedChallenges" 
            :key="challenge.id"
            :challenge="challenge"
            @click="handleChallengeClick"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
  definePageMeta({
      layout: 'default'
  })

  import { computed, onMounted } from 'vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const loading = ref(true)
  const error = ref(null)
  const challenges = ref([])
  const userData = ref(null)

  const fetchData = async () => {
    loading.value = true
    error.value = null

    try {
      const [challengesData, userResponse] = await Promise.all([
        $fetch('/api/challenge'),
        $fetch('/api/auth/me')
      ])

      challenges.value = challengesData.data || []
      userData.value = userResponse.user

    } catch (err) {
      console.error('Erreur:', err)
      error.value = err
    } finally {
      loading.value = false
    }
  }

  const username = computed(() => userData.value?.username || 'Utilisateur')

  onMounted(() => {
    fetchData()
  })

  // ✅ Stats mises à jour selon les nouveaux statuts
  const stats = computed(() => {
    const activeChallenges = challenges.value.filter(c => 
      c.status === 'active' || c.status === 'ending_soon'
    )
    const completedChallenges = challenges.value.filter(c => c.status === 'completed')
    const urgentChallenges = challenges.value.filter(c => c.status === 'ending_soon')
    const organizedChallenges = challenges.value.filter(c => c.type === 'organized')
    
    return [
      {
        id: 1,
        icon: '🏃‍♂️',
        value: activeChallenges.length,
        label: 'Défis en cours'
      },
      {
        id: 2,
        icon: '✅',
        value: completedChallenges.length,
        label: 'Défis terminés'
      },
      {
        id: 3,
        icon: '⚡',
        value: urgentChallenges.length,
        label: 'Urgent'
      },
      {
        id: 4,
        icon: '👑',
        value: organizedChallenges.length,
        label: 'Organisés'
      }
    ]
  })

  // ✅ Défis prioritaires (actifs, triés par date de fin)
  const priorityChallenges = computed(() => {
    const activeChallenges = challenges.value.filter(c => 
      c.status === 'active' || c.status === 'ending_soon'
    )
    
    const sortedChallenges = [...activeChallenges].sort((a, b) => {
      // Prioriser les urgent puis par date de fin
      if (a.status === 'ending_soon' && b.status !== 'ending_soon') return -1
      if (b.status === 'ending_soon' && a.status !== 'ending_soon') return 1
      return new Date(a.endDate) - new Date(b.endDate)
    })
    
    return sortedChallenges.slice(0, 3)
  })

  // ✅ Défis terminés récemment
  const recentCompletedChallenges = computed(() => {
    const completedChallenges = challenges.value.filter(c => c.status === 'completed')
    
    const sortedCompleted = [...completedChallenges].sort((a, b) => {
      return new Date(b.lastActivity) - new Date(a.lastActivity)
    })
    
    return sortedCompleted.slice(0, 2)
  })

  const handleChallengeClick = (challengeId) => {
    router.push(`/challenge/${challengeId}`)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bonne matinée !'
    if (hour < 18) return 'Bon après-midi !'
    return 'Bonne soirée !'
  }

  useHead({
    title: 'Dashboard - Broodl',
    meta: [
      { name: 'description', content: 'Vos défis collaboratifs' }
    ]
  })
</script>

<style scoped>
/* Header */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-lg);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  margin: 0 0 var(--space-xs) 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: var(--text-sm);
  margin: 0;
}

.stat-icon {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
  display: block;
}

.stat-value {
  display: block;
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-xs);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-medium);
}

/* Section header */
.section-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin: 0;
}

.link-button {
  background: none;
  border: none;
  font-size: var(--text-sm);
  cursor: pointer;
  font-family: inherit;
  transition: var(--transition-fast);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
}

.link-button:hover {
  background: rgba(255, 255, 255, 0.1);
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
  font-size: var(--text-4xl);
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

/* ✅ Section spacing */
.priority-challenges, .completed-challenges {
  margin-top: var(--space-3xl);
}

/* Responsive */
@media (max-width: 480px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-lg);
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }
  
  .stat-card {
    padding: var(--space-lg);
  }
  
  .stat-icon {
    font-size: var(--text-xl);
    margin-bottom: var(--space-sm);
  }
  
  .stat-value {
    font-size: var(--text-xl);
  }
  
  .stat-label {
    font-size: var(--text-xs);
  }
}

@media (min-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .challenges-preview {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--component-item-gap);
  }
}

@media (min-width: 1024px) {
  .challenges-preview {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>