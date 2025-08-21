/**
 * Composable pour les utilitaires partagés
 * Fonctions communes utilisées dans plusieurs composants
 */

export const useUtils = () => {
  
  /**
   * Gère les erreurs de chargement d'avatar avec fallbacks
   * @param event - Event d'erreur de l'image
   */
  const handleAvatarError = (event: Event) => {
    const target = event.target as HTMLImageElement
    const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=random&color=fff&size=128'
    
    // Si l'image par défaut échoue aussi, utiliser un placeholder SVG
    if (target.src !== defaultAvatar) {
      target.src = defaultAvatar
    } else {
      // SVG placeholder en base64 en cas d'échec total
      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iY3VycmVudENvbG9yIiBkPSJNMTIsMTlBMywzIDAgMCwxIDksMTZBMywzIDAgMCwxIDEyLDEzQTMsMyAwIDAsMSAxNSwxNkEzLDMgMCAwLDEgMTIsMTlNMTksM0g1QTMgMyAwIDAsMCAyLDZWMThBMyAzIDAgMCwwIDUsMjFIMTlBMi45OSAyLjk5IDAgMCwwIDIyLDE4VjZBMyAzIDAgMCwwIDE5LDNNMTIsNUE0LDAgMCwxLDEgOCw5QTQsNCAwIDAsMSAxMiw1WiIvPjwvc3ZnPg=='
    }
    
    // Empêcher les futures erreurs sur cette image
    target.onerror = null
  }

  /**
   * Formate une valeur numérique en évitant les décimales inutiles
   * @param value - Valeur à formatter
   * @returns String formatée
   */
  const formatValue = (value: number | string): string => {
    const numValue = Number(value)
    if (isNaN(numValue)) return String(value)
    
    return numValue % 1 === 0 ? numValue.toString() : numValue.toFixed(1)
  }

  /**
   * Génère un ID aléatoire simple (pour éléments temporaires)
   * @returns String ID unique
   */
  const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * Transforme un texte en slug URL-friendly
   * @param text - Texte à transformer
   * @returns String slug
   */
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9 -]/g, '') // Supprime les caractères spéciaux
      .replace(/\s+/g, '-') // Remplace les espaces par des tirets
      .replace(/-+/g, '-') // Supprime les tirets multiples
      .trim()
  }

  return {
    handleAvatarError,
    formatValue,
    generateId,
    slugify
  }
}