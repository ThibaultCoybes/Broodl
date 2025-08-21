// Types TypeScript
export interface ChallengeTypeConfig {
    id: string
    name: string
    icon: string
    unit: string
    unitPlaceholder?: string
    types: string[]
    groupModes: string[]
    placeholder: string
  }
  
  // Constantes pour éviter les typos
  export const CATEGORIES = {
    FITNESS: 'fitness',
    FINANCE: 'finance',
    LEARNING: 'learning',
    HEALTH: 'health',
    CREATIVE: 'creative',
    LIFESTYLE: 'lifestyle'
  } as const
  
  export const TYPES = {
    INDIVIDUAL: 'individual',
    GROUP: 'group'
  } as const
  
  export const MODES = {
    COMMON: 'common',
    COLLECTIVE: 'collective'
  } as const
  
  export const VISIBILITIES = {
    PRIVATE: 'private',
    PUBLIC_OPEN: 'public_open',
    PUBLIC_INVITE: 'public_invite'
  } as const
  
  // Types dérivés
  export type CategoryType = typeof CATEGORIES[keyof typeof CATEGORIES]
  export type ChallengeType = typeof TYPES[keyof typeof TYPES]
  export type ModeType = typeof MODES[keyof typeof MODES]
  export type VisibilityType = typeof VISIBILITIES[keyof typeof VISIBILITIES]
  
  // Configuration des catégories de défis
  export const challengeTypes: ChallengeTypeConfig[] = [
    { 
      id: 'fitness',
      name: 'Fitness', 
      icon: '🏃‍♂️',
      unit: 'heures',
      types: ['individual', 'group'],
      groupModes: ['common'],
      placeholder: 'Course Mars 2025'
    },
    { 
      id: 'finance',
      name: 'Finance', 
      icon: '💰',
      unit: '€',
      types: ['individual', 'group'],
      groupModes: ['collective'],
      placeholder: 'Vacances Bali 2025'
    },
    { 
      id: 'learning',
      name: 'Apprentissage', 
      icon: '📚',
      unit: '',
      unitPlaceholder: 'livres, cours, certifs...',
      types: ['individual', 'group'],
      groupModes: ['common', 'collective'],
      placeholder: 'Challenge lecture'
    },
    { 
      id: 'health',
      name: 'Santé', 
      icon: '🍎',
      unit: '',
      unitPlaceholder: 'verres d\'eau, pas...',
      types: ['individual', 'group'],
      groupModes: ['common', 'collective'],
      placeholder: 'Défi bien-être'
    },
    { 
      id: 'creative',
      name: 'Créatif', 
      icon: '🎨',
      unit: '',
      unitPlaceholder: 'dessins, photos...',
      types: ['individual', 'group'],
      groupModes: ['common', 'collective'],
      placeholder: 'Projet créatif'
    },
    { 
      id: 'lifestyle',
      name: 'Lifestyle', 
      icon: '🌱',
      unit: '',
      unitPlaceholder: 'jours, habitudes...',
      types: ['individual', 'group'],
      groupModes: ['common', 'collective'],
      placeholder: '30 jours sans tabac'
    }
] as const