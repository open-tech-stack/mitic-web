// src/config/dashboard-tour.ts

import { TourStep } from '@/components/tour/TourGuide';

export const dashboardHomeTourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur votre tableau de bord',
    description: 'Découvrez les fonctionnalités principales de votre interface de gestion.',
    target: 'dashboard-header',
    position: 'bottom'
  },
  {
    id: 'sidebar-menu',
    title: 'Menu de navigation',
    description: 'Accédez à tous les modules via ce menu latéral.',
    target: 'dashboard-sidebar',
    position: 'right'
  },
  {
    id: 'menu-tabs',
    title: 'Onglets de modules',
    description: 'Naviguez entre les différents modules du système.',
    target: 'menu-tabs',
    position: 'bottom'
  },
  {
    id: 'stats-overview',
    title: 'Vue d\'ensemble',
    description: 'Résumé des performances du module sélectionné.',
    target: 'stats-overview',
    position: 'bottom'
  },
  {
    id: 'stats-grid',
    title: 'Métriques détaillées',
    description: 'Statistiques en temps réel pour chaque module.',
    target: 'stats-grid',
    position: 'top'
  },
  {
    id: 'evolution-chart',
    title: 'Graphique d\'évolution',
    description: 'Visualisez les tendances sur 7 jours.',
    target: 'evolution-chart',
    position: 'left'
  },
  {
    id: 'recent-activity',
    title: 'Activité récente',
    description: 'Suivez les dernières actions du système.',
    target: 'recent-activity',
    position: 'top'
  },
  {
    id: 'quick-actions',
    title: 'Actions rapides',
    description: 'Accès direct aux fonctions principales.',
    target: 'quick-actions',
    position: 'top'
  },
  {
    id: 'chat-support',
    title: 'Support client',
    description: 'Contactez notre équipe pour toute assistance.',
    target: 'chat-support',
    position: 'left'
  }
]

// Configuration pour les nouveaux utilisateurs
export const newUserWelcomeSteps: TourStep[] = [
  {
    id: 'first-visit-welcome',
    title: '🌟 Première visite ?',
    description: 'Bienvenue ! Nous sommes ravis de vous accueillir. Laissez-nous vous présenter votre nouveau tableau de bord en quelques étapes simples.',
    target: 'dashboard-header',
    position: 'center',
    actionText: 'Commencer la visite guidée'
  },
  ...dashboardHomeTourSteps.slice(1) // Reprendre les étapes normales après l'accueil
]

// Étapes rapides pour les utilisateurs récurrents
export const quickTourSteps: TourStep[] = [
  {
    id: 'quick-overview',
    title: '⚡ Tour rapide',
    description: 'Voici un aperçu rapide des nouveautés et fonctionnalités principales.',
    target: 'dashboard-header',
    position: 'center'
  },
  {
    id: 'stats-quick',
    title: '📊 Vos statistiques',
    description: 'Consultez vos métriques importantes en un coup d\'œil.',
    target: 'stats-grid',
    position: 'top'
  },
  {
    id: 'actions-quick',
    title: '⚡ Actions rapides',
    description: 'Accès direct aux fonctions les plus utilisées.',
    target: 'quick-actions',
    position: 'top'
  }
]

// Configuration des préférences utilisateur
export interface TourPreferences {
  autoStart: boolean
  showShortcutHints: boolean
  playSpeed: 'slow' | 'normal' | 'fast'
  skipOptionalSteps: boolean
}

export const defaultTourPreferences: TourPreferences = {
  autoStart: false,
  showShortcutHints: true,
  playSpeed: 'normal',
  skipOptionalSteps: false
}