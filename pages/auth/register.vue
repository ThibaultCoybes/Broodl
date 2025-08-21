<template>
    <div class="auth-page">
      <div class="auth-container card">
        <div class="logo-icon">🎯</div>
        <h1 class="auth-title text-gradient">Inscription</h1>
        <p class="auth-subtitle">Créez votre compte pour commencer</p>
  
        <form class="auth-form" @submit.prevent="handleRegister">
          <input
            v-model="credential.firstname"
            type="text"
            placeholder="Prénom"
            required
            class="auth-input"
            autocomplete="firstname"
          />
          <div v-if="hasError('firstname')" class="error">{{ errors.firstname }}</div>

          <input
            v-model="credential.lastname"
            type="text"
            placeholder="Nom"
            required
            class="auth-input"
            autocomplete="lastname"
          />
          <div v-if="hasError('lastname')" class="error">{{ errors.lastname }}</div>

          <input
            v-model="credential.username"
            type="text"
            placeholder="Nom d'utilisateur"
            required
            class="auth-input"
            autocomplete="username"
          />
          <div v-if="hasError('username')" class="error">{{ errors.username }}</div>

          <input
            v-model="credential.email"
            type="email"
            placeholder="Adresse e-mail"
            required
            class="auth-input"
            autocomplete="email"
          />
          <div v-if="hasError('email')" class="error">{{ errors.email }}</div>

          <input
            v-model="credential.password"
            type="password"
            placeholder="Mot de passe"
            required
            class="auth-input"
            autocomplete="new-password"
          />
          <div v-if="hasError('password')" class="error">{{ errors.password }}</div>

          <input
            v-model="passwordConfirm"
            type="password"
            placeholder="Confirmez le mot de passe"
            required
            class="auth-input"
            autocomplete="new-password"
          />
          <div v-if="hasError('passwordConfirm')" class="error">{{ errors.passwordConfirm }}</div>
          <div v-if="hasError('global')" class="error global-error">{{ errors.global }}</div>

          <button type="submit" class="btn btn-primary">S'inscrire</button>
        </form>
  
        <p class="auth-link">
          Déjà un compte ?
          <a href="#" class="text-gradient-accent" @click.prevent="goToLogin" >Se connecter</a>
        </p>
      </div>
    </div>
</template>
  
<script setup >

    const credential = reactive({
        "firstname": '',
        "lastname": '',
        "username": '',
        "password": '',
        "email": ''
    })

    const passwordConfirm = ref('')

    const errors = ref({
        firstname: '',
        lastname: '',
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        global: ''
    })

    const hasError = (field) => !!errors.value[field]
  
    const handleRegister = async() => {
        errors.value = {
            firstname: '',
            lastname: '',
            username: '',
            email: '',
            password: '',
            passwordConfirm: '',
            global: ''
        }

        if (credential.password !== passwordConfirm.value) {
            errors.value.passwordConfirm = "Les mots de passe ne sont pas identiques"
            return
        }

        try {
            await $fetch('/api/auth/register', {
                method: "POST",
                body: credential
            })

            navigateTo('/dashboard')
        } catch (error) {
            if (error?.data?.data?.issues) {
                error.data.data.issues.forEach(issue => {
                    errors.value[issue.path[0]] = issue.message
                })
            } else if (error?.data?.data?.type === 'email_taken') {
                errors.value.email = 'Cet email est déjà utilisé.'
            } else if (error?.data?.statusMessage) {
                errors.value.global = error.statusMessage
            } else {
                errors.value.global = 'Une erreur inconnue est survenue.'
            }
        }
    }
    
    const goToLogin = () => {
        navigateTo('/auth/login')
    }
    
    useHead({
        title: "Inscription • GoalTracker",
    })
</script>
  
<style scoped>
  .auth-page {
    min-height: 100vh;
    background: var(--bg-primary);
    display: flex;
    justify-content: center;
    align-items: center;
    padding: var(--space-3xl) var(--space-md);
  }
  
  .auth-container {
    width: 100%;
    max-width: 400px;
    padding: var(--space-3xl) var(--space-2xl);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
  }
  
  .logo-icon {
    font-size: var(--text-4xl);
  }
  
  .auth-title {
    font-size: var(--text-2xl);
    font-weight: var(--font-extrabold);
    margin: 0;
  }
  
  .auth-subtitle {
    color: var(--text-secondary);
    font-size: var(--text-sm);
    margin: 0;
    text-align: center;
  }
  
  .auth-form {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }
  
  .auth-input {
    padding: var(--space-md);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-primary);
    background: var(--bg-glass);
    color: var(--text-primary);
    font-size: var(--text-base);
    outline: none;
    transition: border var(--transition-fast);
  }
  
  .auth-input:focus {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-glow);
  }
  
  .auth-link {
    font-size: var(--text-sm);
    color: var(--text-muted);
    text-align: center;
  }
  
</style>