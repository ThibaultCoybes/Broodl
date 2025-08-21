<!-- pages/index.vue -->
<template>
  <div class="welcome">
    <div class="container">

      <!-- HERO SECTION -->
      <section class="hero">
        <div class="hero-content">
          <div class="logo">🤝</div>
          <h1>
            <span class="text-gradient">Broodl</span>
          </h1>
          <p class="tagline">
            Lancez des défis avec vos amis, progressez ensemble, restez motivé 💪
          </p>

          <div class="cta-buttons">
            <template v-if="!isLoggedIn">
              <NuxtLink to="/auth/register" class="btn btn-primary">Créer un compte</NuxtLink>
              <NuxtLink to="/auth/login" class="btn btn-secondary">Se connecter</NuxtLink>
            </template>
            <template v-else>
              <NuxtLink to="/dashboard" class="btn btn-secondary">Aller au dashboard</NuxtLink>
            </template>
          </div>
        </div>
      </section>

      <!-- FEATURES -->
      <section class="features" aria-label="Fonctionnalités de l'application">
        <div class="feature card">
          <div class="icon">🎯</div>
          <h3>Objectifs collectifs</h3>
          <p>Économisez pour un voyage, un projet ou un défi ensemble. Le groupe vous porte.</p>
        </div>
        <div class="feature card">
          <div class="icon">💬</div>
          <h3>Motivation constante</h3>
          <p>Encouragez-vous via le chat et suivez les progrès de chacun en temps réel.</p>
        </div>
        <div class="feature card">
          <div class="icon">📸</div>
          <h3>Souvenirs visuels</h3>
          <p>Partagez des photos de vos étapes, vos réussites, vos moments de victoire.</p>
        </div>
      </section>

      <!-- APP PRESENTATION -->
      <section class="presentation" aria-label="Présentation de l'application">
        <h2>Pourquoi choisir Broodl ?</h2>
        <p>
          Broodl vous permet de créer des défis amusants et engageants avec vos amis ou votre communauté. Suivez vos progrès, échangez des encouragements, et célébrez vos succès ensemble. 
          Que ce soit pour du sport, des projets créatifs ou des objectifs personnels, Broodl est votre partenaire de motivation.
        </p>
        <p>
          Commencez dès maintenant et faites de chaque défi une aventure collective !
        </p>
      </section>

      <!-- DEMO CALL -->
      <section class="try-now" aria-label="Démarrer un défi">
        <NuxtLink v-if="!isLoggedIn" to="/auth/login" class="cta-start" aria-label="Lancer un défi maintenant">
          🚀 Lancer un défi maintenant
        </NuxtLink>
        <NuxtLink v-else to="/dashboard" class="cta-start" aria-label="Lancer un défi maintenant">
          🚀 Lancer un défi maintenant
        </NuxtLink>
        <p class="subtext">C'est gratuit, collaboratif et fun ✨</p>
      </section>

      <!-- STATS -->
      <section class="stats bg-glass" aria-label="Statistiques de l'application">
        <h3>La force du collectif</h3>
        <div class="stats-grid">
          <div class="stat">
            <div class="stat-number text-gradient-accent">+1 200</div>
            <div class="stat-label">Projets lancés</div>
          </div>
          <div class="stat">
            <div class="stat-number text-gradient-accent">92%</div>
            <div class="stat-label">Défis complétés</div>
          </div>
          <div class="stat">
            <div class="stat-number text-gradient-accent">+8 000</div>
            <div class="stat-label">Participants motivés</div>
          </div>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="footer bg-glass" role="contentinfo">
        <div class="status-dot active" aria-label="Statut en ligne"></div>
        <span>Broodl v1.0 — Construisez vos projets ensemble ❤️</span>
      </footer>
    </div>
  </div>
</template>

<script setup>
const authUser = useState('authUser')
const isLoggedIn = computed(() => !!authUser.value?.user)
</script>

<style scoped>
/* Container principal */
.welcome {
  min-height: 100vh;
  background: var(--bg-primary);
  padding: var(--space-3xl) var(--space-lg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  max-width: 780px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-3xl);
}

/* Hero */
.hero {
  text-align: center;
}

.logo {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.hero h1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  letter-spacing: -1px;
}

.tagline {
  margin-top: var(--space-md);
  font-size: var(--text-lg);
  color: var(--text-secondary);
}

.cta-buttons {
  margin-top: var(--space-xl);
  display: flex;
  gap: var(--space-lg);
  justify-content: center;
  flex-wrap: wrap;
}

/* Features */
.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-xl);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature .icon {
  background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: var(--space-md);
  box-shadow: var(--shadow-sm);
  color: #fff;
}

.feature h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-xs);
}

.feature p {
  color: var(--text-muted);
}

/* Presentation */
.presentation {
  background: rgba(255, 255, 255, 0.03);
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  text-align: center;
}

.presentation h2 {
  font-size: var(--text-2xl);
  margin-bottom: var(--space-md);
}

.presentation p {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

/* Try now */
.try-now {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-start {
  background: var(--gradient-accent);
  padding: var(--space-lg) var(--space-2xl);
  font-size: var(--text-lg);
  border-radius: var(--radius-xl);
  color: var(--text-primary);
  box-shadow: var(--shadow-primary);
  transition: var(--transition-bounce);
  text-decoration: none;
}

.subtext {
  margin-top: var(--space-sm);
  color: var(--text-muted);
  font-size: var(--text-sm);
}

/* Stats */
.stats {
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  text-align: center;
  box-shadow: var(--shadow-md);
}

.stats h3 {
  font-size: var(--text-xl);
  margin-bottom: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--space-xl);
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* Footer */
.footer {
  text-align: center;
  font-size: var(--text-sm);
  color: var(--text-muted);
  padding: var(--space-lg) 0;
  display: flex;
  gap: var(--space-sm);
  justify-content: center;
  align-items: center;
}
</style>