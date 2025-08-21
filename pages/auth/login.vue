<template>
    <div class="login-page">
        <div class="login-container card">
            <div class="logo-icon">🎯</div>
            <h1 class="login-title text-gradient">Connexion</h1>
            <p class="login-subtitle">Reprenez votre progression</p>
  
        <form class="login-form" @submit.prevent="handleLogin">
            <input
                v-model="credential.email"
                type="email"
                placeholder="Adresse e-mail"
                required
                class="login-input"
            >
            <input
                v-model="credential.password"
                type="password"
                placeholder="Mot de passe"
                required
                class="login-input"
            >
            <div v-if="hasError('global')" class="error">{{ errors.global }}</div>
            
            <button type="submit" class="btn btn-primary">Se connecter</button>
        </form>
  
        <p class="register-link">
            Pas encore de compte ?
            <a href="#" class="text-gradient-accent" @click.prevent="goToRegister">S'inscrire</a>
        </p>
      </div>
    </div>
</template>
  
<script setup >
import { navigateTo } from '#app'

    const credential = reactive({
        email: '',
        password: ''
    })
    const errors = ref({
        global: ''
    })
    
    const hasError = (field) => !!errors.value[field]

    const handleLogin = async() => {
        errors.value = {
            global: ''
        }

        try {
            const response = await $fetch('/api/auth/login', {
                method: 'POST',
                body: credential
            })

            if(response.success){
                console.log(response)
                await navigateTo('/dashboard')
            }
        } catch (error) {
            return errors.value.global = error.statusMessage
        }
    }
    
    const goToRegister = () => {
        navigateTo('/auth/register')
    }
    
    useHead({
        title: 'Connexion • GoalTracker',
    })
</script>
  
<style scoped>
    .login-page {
        min-height: 100vh;
        background: var(--bg-primary);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: var(--space-3xl) var(--space-md);
    }
    
    .login-container {
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
    
    .login-title {
        font-size: var(--text-2xl);
        font-weight: var(--font-extrabold);
        margin: 0;
    }
    
    .login-subtitle {
        color: var(--text-secondary);
        font-size: var(--text-sm);
        margin: 0;
    }
    
    .login-form {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: var(--space-md);
    }
    
    .login-input {
        padding: var(--space-md);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-primary);
        background: var(--bg-glass);
        color: var(--text-primary);
        font-size: var(--text-base);
        outline: none;
        transition: border var(--transition-fast);
    }
    
    .register-link {
        font-size: var(--text-sm);
        color: var(--text-muted);
        text-align: center;
    }
</style>