/**
 * Composable pour centraliser les fonctions de formatage de dates
 * Évite la duplication de code entre les composants
 */

export const useDateFormatting = () => {
  
  /**
   * Formate une date en "il y a X temps"
   * @param date - Date à formatter
   * @returns String formatée (ex: "Il y a 2h", "Hier", "5j")
   */
  const formatTimeAgo = (date: string | Date): string => {
    if (!date) return ''
    
    const now = new Date()
    const past = new Date(date)
    const diff = now.getTime() - past.getTime()
    
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(hours / 24)
    
    if (minutes < 1) return 'À l\'instant'
    if (minutes < 60) return `Il y a ${minutes}min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days === 1) return 'Hier'
    if (days <= 30) return `Il y a ${days}j`
    
    return new Intl.DateTimeFormat('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    }).format(past)
  }

  /**
   * Formate une date de fin en "Dans X temps" ou "Terminé"
   * @param date - Date de fin
   * @returns String formatée (ex: "Dans 5 jours", "Demain", "Terminé")
   */
  const formatEndDate = (date: string | Date): string => {
    const now = new Date()
    const endDate = new Date(date)
    const diff = endDate.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    if (days < 0) return 'Terminé'
    if (days === 0) return 'Aujourd\'hui'
    if (days === 1) return 'Demain'
    if (days <= 7) return `Dans ${days} jours`
    if (days <= 30) return `Dans ${Math.ceil(days / 7)} semaines`
    
    return `Dans ${Math.ceil(days / 30)} mois`
  }

  /**
   * Calcule le nombre de jours restants
   * @param endDate - Date de fin
   * @returns Nombre de jours (peut être négatif si terminé)
   */
  const getDaysLeft = (endDate: string | Date): number => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  /**
   * Formate une date courte pour affichage (ex: "15 mar")
   * @param date - Date à formatter
   * @returns Date formatée courte
   */
  const formatShortDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short'
    })
  }

  /**
   * Détermine l'urgence d'une date de fin
   * @param endDate - Date de fin
   * @returns 'high' | 'medium' | 'low'
   */
  const getUrgencyLevel = (endDate: string | Date): 'high' | 'medium' | 'low' => {
    const daysLeft = getDaysLeft(endDate)
    
    if (daysLeft <= 2) return 'high'
    if (daysLeft <= 7) return 'medium'
    return 'low'
  }

  return {
    formatTimeAgo,
    formatEndDate,
    getDaysLeft,
    formatShortDate,
    getUrgencyLevel
  }
}