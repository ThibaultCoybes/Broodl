/**
 * Composable pour centraliser la configuration de navigation
 * Évite la duplication entre layout et composants
 */

export interface NavItem {
  path: string
  icon: string
  label: string
  badge?: number
  isSpecial?: boolean
}

export const useNavigation = () => {
  
  /**
   * Configuration principale de navigation de l'app
   * Source unique de vérité pour tous les éléments de nav
   */
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
      badge: 0
    },
    {
      path: '/challenge',
      icon: '🎯',
      label: 'Défis',
      badge: 0 // Badge dynamique à mettre à jour selon les données
    },
    {
      path: '/challenge/create',
      icon: '➕',
      label: 'Créer',
      isSpecial: true
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profil',
      badge: 0
    }
  ]

  /**
   * Pages où la bottom nav ne doit pas apparaître
   */
  const excludedRoutes = [
    '/auth/login',
    '/auth/register',
    '/'
  ]

  /**
   * Vérifie si un chemin correspond à l'état actif
   * @param itemPath - Chemin de l'item de navigation
   * @param currentPath - Chemin actuel de la route
   * @returns boolean - true si actif
   */
  const isActive = (itemPath: string, currentPath: string): boolean => {
    if (itemPath === '/dashboard') {
      return currentPath === '/' || currentPath === '/dashboard'
    }
    
    return currentPath.startsWith(itemPath) && itemPath !== '/'
  }

  /**
   * Vérifie si la navigation doit être affichée sur une route
   * @param currentPath - Chemin actuel
   * @returns boolean - true si nav visible
   */
  const shouldShowNavigation = (currentPath: string): boolean => {
    return !excludedRoutes.some(excluded => 
      currentPath.startsWith(excluded)
    )
  }

  /**
   * Met à jour le badge d'un item de navigation
   * @param path - Chemin de l'item
   * @param count - Nouveau nombre pour le badge
   */
  const updateBadge = (path: string, count: number) => {
    const item = navItems.find(item => item.path === path)
    if (item) {
      item.badge = count
    }
  }

  return {
    navItems: readonly(navItems),
    excludedRoutes: readonly(excludedRoutes),
    isActive,
    shouldShowNavigation,
    updateBadge
  }
}