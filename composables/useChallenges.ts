export interface ChallengeListItem {
    id: string
    title: string
    description: string
    category: string
    icon: string
    status: 'active' | 'ending_soon' | 'completed' | 'paused'
    type: 'active' | 'organized' | 'completed'
    isCreator: boolean
    progress: number
    currentValue: number
    targetValue: number
    unit: string
    streak?: number
    participants: Array<{
      id: number
      name: string
      avatar: string
    }>
    endDate: Date
    lastActivity?: Date
  }
  
  export const useChallenges = () => {
    const challenges = ref<ChallengeListItem[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)
  
    const fetchUserChallenges = async (): Promise<ChallengeListItem[]> => {
      if (loading.value) return challenges.value
    
      loading.value = true
      error.value = null
      
      try {
        const response = await $fetch<{data: ChallengeListItem[], success: boolean}>('/api/challenge')
        
        if (!response.success) {
          throw new Error('Erreur lors du chargement des défis')
        }
        
        if (JSON.stringify(challenges.value) !== JSON.stringify(response.data)) {
          challenges.value = response.data
        }
        
        return response.data
      } catch (err: any) {
        error.value = err.message || 'Erreur de chargement'
        console.error('Fetch challenges error:', err)
        throw err
      } finally {
        loading.value = false
      }
    }
  
    return {
      challenges: readonly(challenges),
      loading: readonly(loading),
      error: readonly(error),
      fetchUserChallenges
    }
  }