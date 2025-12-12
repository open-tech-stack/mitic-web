'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  Settings,
  Building2,
  Users,
  Route,
  MapPin,
  CreditCard,
  Minus,
  FileText,
  Landmark,
  Wallet,
  PiggyBank,
  HandCoins,
  WalletCards,
  Workflow,
  ChevronRight,
  ChevronLeft,
  X,
  Home,
  Calendar,
  List,
  DollarSign,
  Shield,
  BadgeSwissFranc,
  MessageCircleQuestionMark,
  SwissFranc,
  History,
  Notebook,
  BarChart3,
  Receipt,
  LogOut,
  Users2,
  SquaresSubtract,
  UserCheck
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import Loader from '@/components/ui/Loader'
import Image from 'next/image'
import { User } from '@/types/auth.types'
import { useAuth } from '@/hooks/useAuth'
import { useNavigationWithLoader } from '@/hooks/useNavigationWithLoader'

interface DashboardSidebarProps {
  isCollapsed: boolean
  onToggle: () => void
  onClose: () => void
  user: User | null
  hasPermission: (permission: string) => boolean
}

interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
  parent?: string;
  requiredPermissions?: string[];
  requiredRole?: string;
}

// Configuration COMPLÈTE des menus avec permissions par rôle
const getMenuItems = (hasPermission: (permission: string) => boolean, userRole?: string): MenuItem[] => {

  // ==================== DÉFINITION DE TOUS LES MENUS ====================

  const allMenuItems: MenuItem[] = [
    // TABLEAU DE BORD - Accessible à tous
    {
      name: 'Tableau de bord',
      href: '/dashboard/home',
      icon: Home,
      // requiredPermissions: ['READ_AFFICHAGE_CAISSE']
    },

    // ==================== PARAMÉTRAGES ====================
    {
      name: 'Paramétrages',
      icon: Settings,
      requiredPermissions: ['READ_USER', 'READ_PEAGE', 'READ_LOCALITE'],
      children: [
        // === DIVERS ===
        {
          name: 'Divers',
          icon: BarChart3,
          requiredPermissions: ['READ_USER', 'READ_PCG', 'READ_PERIODICITE_TICKET'],
          children: [
            // SÉCURITÉ - Super Admin uniquement
            {
              name: 'Sécurité',
              href: '/dashboard/divers/securite',
              icon: Shield,
              requiredPermissions: ['READ_PERMISSION', 'READ_ROLE', 'READ_ASSOCIATION_ROLE_PERMISSION'],
              // requiredRole: 'SUPER_ADMIN'
            },
            // ORGANISATION - Super Admin uniquement
            {
              name: 'Organisation',
              href: '/dashboard/divers/uo',
              icon: Building2,
              requiredPermissions: ['CRUD_UO'],
              // requiredRole: 'SUPER_ADMIN'
            },
            // PLAN COMPTABLE - Admin, Super Admin, Caissier Principal
            {
              name: 'Plan Comptable',
              href: '/dashboard/divers/pcg',
              icon: Notebook,
              requiredPermissions: ['READ_PCG']
            },
            // UTILISATEURS - Super Admin uniquement
            {
              name: 'Utilisateurs',
              href: '/dashboard/divers/utilisateurs',
              icon: Users,
              requiredPermissions: ['READ_USER', 'CREATE_USER', 'UPDATE_USER'],
              // requiredRole: 'SUPER_ADMIN'
            },
            // PÉRIODICITÉ - Admin, Super Admin, Caissier Principal
            {
              name: 'Périodicité',
              href: '/dashboard/divers/periodicite',
              icon: Calendar,
              requiredPermissions: ['READ_PERIODICITE_TICKET']
            },
            // PÉRIODICITÉ - Admin, Super Admin, Caissier Principal
            {
              name: 'Période Tarif',
              href: '/dashboard/divers/periode-tarif',
              icon: Calendar,
              requiredPermissions: ['READ_PERIODICITE_TICKET']
            },
          ]
        },

        // === GESTION DES TRAJETS ===
        {
          name: 'Gestion des trajets',
          icon: Route,
          requiredPermissions: ['READ_LOCALITE', 'READ_PEAGE', 'READ_TRONCON'],
          children: [
            // LOCALITÉS - Admin, Super Admin
            {
              name: 'Localités',
              href: '/dashboard/gestion-trajets/localites',
              icon: MapPin,
              requiredPermissions: ['READ_LOCALITE']
            },
            // PÉAGES - Admin, Super Admin
            {
              name: 'Péages',
              href: '/dashboard/gestion-trajets/peages',
              icon: CreditCard,
              requiredPermissions: ['READ_PEAGE']
            },
            // TRONÇONS - Admin, Super Admin
            {
              name: 'Tronçons',
              href: '/dashboard/gestion-trajets/troncons',
              icon: Minus,
              requiredPermissions: ['READ_TRONCON']
            },
            // CATÉGORIE - Admin, Super Admin, Caissier Principal
            {
              name: 'Catégorie',
              icon: List,
              requiredPermissions: ['READ_TYPE_CATEGORIE', 'READ_TARIF'],
              children: [
                {
                  name: 'Type',
                  href: '/dashboard/gestion-trajets/categories/type',
                  icon: FileText,
                  requiredPermissions: ['READ_TYPE_CATEGORIE']
                },
                {
                  name: 'Tarif',
                  href: '/dashboard/gestion-trajets/categories/tarif',
                  icon: DollarSign,
                  requiredPermissions: ['READ_TARIF']
                },
                {
                  name: 'Montants',
                  href: '/dashboard/gestion-trajets/categories/type-montant',
                  icon: BadgeSwissFranc,
                  requiredPermissions: ['READ_TYPE_MONTANT']
                },
              ]
            },
          ]
        },

        // === COMPTES ===
        {
          name: 'Comptes',
          icon: Landmark,
          requiredPermissions: ['READ_COMPTE', 'READ_TYPE_COMPTE'],
          children: [
            // TYPES DE COMPTE - Admin, Super Admin
            {
              name: 'Types',
              href: '/dashboard/comptes/type',
              icon: Wallet,
              requiredPermissions: ['READ_TYPE_COMPTE']
            },
            // COMPTES - Admin, Super Admin, Caissier Principal
            {
              name: 'Comptes',
              href: '/dashboard/comptes/compte',
              icon: PiggyBank,
              requiredPermissions: ['READ_COMPTE']
            },
            // HISTORIQUE - Admin, Super Admin, Caissier Principal
            {
              name: 'Historique',
              href: '/dashboard/comptes/historique',
              icon: History,
              requiredPermissions: ['READ_HISTORIQUE_ECRITURE']
            },
          ]
        },

        // === OPÉRATIONS ===
        {
          name: 'Opérations',
          icon: HandCoins,
          requiredPermissions: ['READ_OPERATION', 'READ_TYPE_OPERATION'],
          children: [
            // TYPES D'OPÉRATION - Admin, Super Admin, Caissier Principal
            {
              name: 'Types',
              href: '/dashboard/operations/type',
              icon: FileText,
              requiredPermissions: ['READ_TYPE_OPERATION']
            },
            // MONTANT OPÉRATION - Admin, Super Admin, Caissier Principal
            {
              name: 'Montant Operation',
              href: '/dashboard/operations/operation-montant-type',
              icon: SwissFranc,
              requiredPermissions: ['READ_TYPE_MONTANT_OPERATION_ASSOCIATION']
            },
            // MODES DE RÈGLEMENT - Admin, Super Admin, Caissier Principal
            {
              name: 'Modes de règlement',
              href: '/dashboard/operations/mode-reglement',
              icon: WalletCards,
              requiredPermissions: ['READ_TYPE_REGLEMENT']
            },
            // SCHÉMAS COMPTABLES - Admin, Super Admin
            {
              name: 'Schémas comptables',
              href: '/dashboard/operations/schema-comptable',
              icon: Workflow,
              requiredPermissions: ['READ_SCHEMA_COMPTABLE']
            },
          ]
        },
      ]
    },


    // ==================== GESTION DES CAISSES ====================

    //=======ABONNE===//

    {
      name: 'Abonnement',
      icon: UserCheck,
      requiredPermissions: [' READ_CLIENT', 'READ_ABONNEMENT'],
      children: [
        {
          name: 'Clients',
          href: '/dashboard/abonnement/clients',
          icon: Users,
          requiredPermissions: ['READ_CLIENT'],

        },
        {
          name: 'Abonnements',
          href: '/dashboard/abonnement/abonnements',
          icon: SquaresSubtract,
          requiredPermissions: ['READ_ABONNEMENT'],

        },
      ]
    },

    // ==================== GESTION DES CAISSES ====================


    // === CAISSE === (pour caissier principal)
    {
      name: 'Caisses',
      icon: Receipt,
      requiredPermissions: ['OUVRIR_CAISSE', 'FERMER_CAISSE_PRINCIPALE', 'READ_CAISSE'],
      children: [
        {
          name: 'État Caisse',
          href: '/dashboard/caissierCaisse/etat',
          icon: BarChart3,
          requiredPermissions: ['READ_CAISSE'],
          requiredRole: 'CAISSIER_PRINCIPAL'

        },
      ]
    },

    // === AGENT === (pour agent principale)
    {
      name: 'Gestion Agents',
      icon: Receipt,
      requiredPermissions: ['READ_AGENT_CAISSE',],
      children: [
        {
          name: 'État Caisse',
          href: '/dashboard/agentCaisse/etat',
          icon: BarChart3,
          requiredPermissions: ['READ_AGENT_CAISSE'],
          requiredRole: 'AGENT'
        },
        {
          name: 'Mes Agents',
          href: '/dashboard/agentCaisse/agents',
          icon: Users2,
          requiredPermissions: ['READ_AGENT_CAISSE'],
          requiredRole: 'AGENT'
        },
      ]
    },

    // ==================== AIDE ====================
    // Accessible à TOUS les utilisateurs connectés
    {
      name: 'Aide',
      href: '/dashboard/help',
      icon: MessageCircleQuestionMark
    },

    // ==================== Deconnexion ====================
    // Accessible à TOUS les utilisateurs connectés
    {
      name: 'Deconnexion',
      href: '/dashboard/logout',
      icon: LogOut
    },
  ];

  const { logout, isLoading: authLoading } = useAuth();

  // ==================== FONCTION DE FILTRAGE ====================

  /**
   * Fonction récursive pour filtrer les items selon les permissions
   */
  const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
    return items.reduce<MenuItem[]>((filtered, item) => {
      // Vérifier les permissions pour cet item
      const hasRequiredPermissions = !item.requiredPermissions ||
        item.requiredPermissions.some(hasPermission);

      // Vérifier le rôle
      const hasRequiredRole = !item.requiredRole || userRole === item.requiredRole;

      // Si l'item n'a pas les permissions requises, le sauter
      if (!hasRequiredPermissions || !hasRequiredRole) {
        return filtered;
      }

      // Filtrer les enfants récursivement
      let filteredChildren: MenuItem[] | undefined;
      if (item.children) {
        filteredChildren = filterMenuItems(item.children);

        // Si l'item a des enfants mais qu'aucun n'est accessible après filtrage
        if (filteredChildren.length === 0 && !item.href) {
          // Supprimer l'item parent s'il n'a pas de lien direct et plus d'enfants
          return filtered;
        }
      }

      // Ajouter l'item avec ses enfants filtrés
      filtered.push({
        ...item,
        children: filteredChildren
      });

      return filtered;
    }, []);
  };

  // Appliquer le filtrage
  return filterMenuItems(allMenuItems);
};

export default function DashboardSidebar({
  isCollapsed,
  onToggle,
  onClose,
  user,
  hasPermission
}: DashboardSidebarProps) {
  const pathname = usePathname()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])

  // Utiliser le hook de navigation
  const { isNavigating, currentNavigationItem, navigate } = useNavigationWithLoader();

  // Récupérer les menus filtrés selon les permissions
  const menuItems = getMenuItems(hasPermission, user?.role)

  const handleNavigation = (href: string, itemName: string) => {
    navigate(href, itemName);
  };

  const toggleItem = (itemName: string) => {
    if (openItems.includes(itemName)) {
      setOpenItems(openItems.filter(name => name !== itemName))
    } else {
      setOpenItems([...openItems, itemName])
    }
  }

  const isItemOpen = (itemName: string) => openItems.includes(itemName)

  const isRouteActive = (href?: string) => {
    if (!href) return false
    return pathname.startsWith(href)
  }

  // Fonction pour tronquer le texte
  const truncateText = (text: string, maxLength: number = 20) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isActive = item.href ? isRouteActive(item.href) : false
    const isOpen = isItemOpen(item.name)
    const isLongText = item.name.length > 20

    return (
      <div key={item.name} className="relative">
        <div
          onMouseEnter={() => setHoveredItem(item.name)}
          onMouseLeave={() => setHoveredItem(null)}
          className="relative"
        >
          <button
            onClick={() => {
              if (hasChildren) {
                toggleItem(item.name)
              } else if (item.href) {
                handleNavigation(item.href, item.name)
              }
            }}
            disabled={isNavigating}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative ${isActive
              ? 'bg-amber-600/40 text-amber-100 shadow-lg'
              : 'text-amber-200/80 hover:bg-amber-700/30 hover:text-amber-100'
              } ${isNavigating ? 'opacity-70 cursor-not-allowed' : ''}`}
            style={{ paddingLeft: `${level * 16 + 12}px` }}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                  animate={{ opacity: 1, width: 'auto', marginLeft: 12 }}
                  exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex-1 flex items-center justify-between min-w-0"
                >
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-medium text-left block truncate w-full" title={item.name}>
                      {truncateText(item.name)}
                    </span>
                  </div>

                  {hasChildren && (
                    <motion.div
                      animate={{ rotate: isOpen ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 flex-shrink-0"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!hasChildren && !isCollapsed && (
              <motion.div
                animate={{
                  x: hoveredItem === item.name ? 0 : -10,
                  opacity: hoveredItem === item.name || isActive ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
                className="ml-2 flex-shrink-0"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            )}
          </button>

          {/* Tooltip pour état collapsed ou texte tronqué */}
          <AnimatePresence>
            {hoveredItem === item.name && (isCollapsed || isLongText) && (
              <motion.div
                initial={{ opacity: 0, x: 10, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`absolute ${isCollapsed ? 'left-full ml-2' : 'left-0 top-full mt-1'} px-3 py-2 bg-amber-800/95 backdrop-blur-sm rounded-lg shadow-lg z-[60] pointer-events-none border border-amber-700/30`}
                style={{
                  top: isCollapsed ? '0' : 'auto',
                  left: isCollapsed ? '100%' : '0'
                }}
              >
                <div className="whitespace-nowrap">
                  <span className="text-sm text-amber-100 font-medium">
                    {item.name}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Render children si menu ouvert et pas collapsed */}
        {hasChildren && !isCollapsed && isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-1 mt-1 ml-2 border-l border-amber-700/20 pl-2">
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </div>
          </motion.div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Navigation Loader */}
      <Loader
        isVisible={isNavigating}
        message={`Chargement de ${currentNavigationItem}...`}
        variant="navigation"
      />

      {/* Overlay pour mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm lg:hidden z-40"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        animate={{ width: isCollapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-full bg-gradient-to-b from-amber-900/95 to-amber-800/90 backdrop-blur-xl shadow-2xl border-r border-amber-700/30 z-50"
        data-tour="dashboard-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-4 border-b border-amber-700/30 flex-shrink-0 min-h-[72px]">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center space-x-3 min-w-0 flex-1"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-600/30 flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="Logo"
                      width={24}
                      height={24}
                      className="object-contain"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextSibling as HTMLElement;
                        if (fallback) {
                          fallback.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="hidden items-center justify-center w-full h-full">
                      <span className="text-amber-200 font-bold text-sm">GP</span>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <span className="text-amber-100 font-bold text-lg truncate block">Gestion Peages</span>
                    {user && (
                      <span className="text-amber-200/60 text-xs truncate block">
                        {user.prenom} {user.nom} • {user.role}
                      </span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center space-x-2 flex-shrink-0">
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-amber-700/30 transition-all duration-200 hover:scale-105"
              >
                <motion.div
                  animate={{ rotate: isCollapsed ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="w-4 h-4 text-amber-200" />
                </motion.div>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-amber-700/30 transition-all duration-200 hover:scale-105 lg:hidden"
              >
                <X className="w-4 h-4 text-amber-200" />
              </button>
            </div>
          </div>

          {/* Navigation - Scrollable */}
          <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-700/30 scrollbar-track-transparent">
            <div className="p-3 space-y-2 pt-6">
              {menuItems.map(item => renderMenuItem(item))}
            </div>

            {menuItems.length <= 2 && (
              <div className="p-4 text-center">
                <p className="text-amber-200/60 text-sm">
                  Interface adaptée à votre profil
                </p>
              </div>
            )}
          </nav>

          {/* Footer - Fixed */}
          <div className="p-4 border-t border-amber-700/30 flex-shrink-0">
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-center"
                >
                  <div className="text-amber-200/60 text-sm mb-1">
                    © 2025 Gestion Peages
                  </div>
                  {user && (
                    <div className="text-amber-200/40 text-xs">
                      {user.role} • {menuItems.length} modules
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  )
}