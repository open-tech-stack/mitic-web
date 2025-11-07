"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Users,
  MapPin,
  CreditCard,
  Minus,
  FileText,
  Tags,
  Wallet,
  PiggyBank,
  HandCoins,
  WalletCards,
  Workflow,
  TrendingUp,
  BarChart3,
  Activity,
  Calendar,
  User,
  Bell,
  ChevronRight,
  ArrowUpRight,
  Eye,
  Home,
  Settings,
  Grid3X3,
  Route,
  Landmark,
  PieChart,
  DollarSign,
  Target,
  Clock,
  Download,
} from "lucide-react";

// Types pour les données
interface StatItem {
  label: string;
  value: string | number;
  change?: string;
  icon: any;
  color: string;
}

interface MenuStats {
  id: string;
  title: string;
  icon: any;
  description: string;
  total: string;
  growth: string;
  stats: StatItem[];
  chartData?: any[];
}

// Données statistiques pour chaque menu
const menuStatsData: MenuStats[] = [
  {
    id: "home",
    title: "Tableau de Bord",
    icon: Home,
    description: "Vue générale du système",
    total: "1,247",
    growth: "+12% ce mois-ci",
    stats: [
      {
        label: "Transactions totales",
        value: "1,247",
        change: "+12%",
        icon: Activity,
        color: "bg-blue-500",
      },
      {
        label: "Recettes mensuelles",
        value: "425,750 FCFA",
        change: "+8%",
        icon: DollarSign,
        color: "bg-green-500",
      },
      {
        label: "Taux utilisation",
        value: "78%",
        change: "+3%",
        icon: Target,
        color: "bg-amber-500",
      },
      {
        label: "Temps moyen",
        value: "3.4 min",
        change: "-0.2 min",
        icon: Clock,
        color: "bg-purple-500",
      },
    ],
  },
  {
    id: "organisation",
    title: "Organisation",
    icon: Building2,
    description: "Gestion des unités organisationnelles",
    total: "12",
    growth: "+3 ce mois-ci",
    stats: [
      {
        label: "Unités actives",
        value: "8",
        change: "+2",
        icon: Building2,
        color: "bg-blue-500",
      },
      {
        label: "En attente",
        value: "2",
        change: "0",
        icon: Clock,
        color: "bg-amber-500",
      },
      {
        label: "Archivées",
        value: "2",
        change: "+1",
        icon: FileText,
        color: "bg-gray-500",
      },
      {
        label: "Utilisateurs par unité",
        value: "4.2",
        change: "+0.3",
        icon: Users,
        color: "bg-green-500",
      },
    ],
  },
  {
    id: "utilisateurs",
    title: "Utilisateurs",
    icon: Users,
    description: "Gestion des comptes utilisateurs",
    total: "48",
    growth: "+5 ce mois-ci",
    stats: [
      {
        label: "Administrateurs",
        value: "3",
        change: "0",
        icon: User,
        color: "bg-purple-500",
      },
      {
        label: "Gestionnaires",
        value: "12",
        change: "+2",
        icon: Users,
        color: "bg-blue-500",
      },
      {
        label: "Opérateurs",
        value: "33",
        change: "+3",
        icon: User,
        color: "bg-green-500",
      },
      {
        label: "Connectés (maintenant)",
        value: "14",
        change: "+4",
        icon: Activity,
        color: "bg-amber-500",
      },
    ],
  },
  {
    id: "localites",
    title: "Localités",
    icon: MapPin,
    description: "Gestion des localités virtuelles et réelles",
    total: "24",
    growth: "+2 ce mois-ci",
    stats: [
      {
        label: "Localités réelles",
        value: "15",
        change: "+1",
        icon: MapPin,
        color: "bg-green-500",
      },
      {
        label: "Localités virtuelles",
        value: "9",
        change: "+1",
        icon: MapPin,
        color: "bg-blue-500",
      },
      {
        label: "Trajets définis",
        value: "36",
        change: "+4",
        icon: Route,
        color: "bg-amber-500",
      },
      {
        label: "Péages associés",
        value: "18",
        change: "+2",
        icon: CreditCard,
        color: "bg-purple-500",
      },
    ],
  },
  {
    id: "peages",
    title: "Péages",
    icon: CreditCard,
    description: "Gestion des points de péage",
    total: "8",
    growth: "+1 ce mois-ci",
    stats: [
      {
        label: "Péages actifs",
        value: "6",
        change: "+1",
        icon: Activity,
        color: "bg-green-500",
      },
      {
        label: "En maintenance",
        value: "2",
        change: "0",
        icon: Clock,
        color: "bg-amber-500",
      },
      {
        label: "Recettes moyennes/jour",
        value: "53,200 FCFA",
        change: "+2,100 FCFA",
        icon: DollarSign,
        color: "bg-blue-500",
      },
      {
        label: "Transactions moyennes/jour",
        value: "156",
        change: "+12",
        icon: CreditCard,
        color: "bg-purple-500",
      },
    ],
  },
  {
    id: "comptes",
    title: "Comptes",
    icon: PiggyBank,
    description: "Gestion des comptes financiers",
    total: "142",
    growth: "+12 ce mois-ci",
    stats: [
      {
        label: "Comptes courants",
        value: "85",
        change: "+5",
        icon: Wallet,
        color: "bg-blue-500",
      },
      {
        label: "Comptes épargne",
        value: "45",
        change: "+7",
        icon: PiggyBank,
        color: "bg-green-500",
      },
      {
        label: "Autres comptes",
        value: "12",
        change: "0",
        icon: FileText,
        color: "bg-gray-500",
      },
      {
        label: "Solde total",
        value: "2,458,320 FCFA",
        change: "+145,600 FCFA",
        icon: DollarSign,
        color: "bg-amber-500",
      },
    ],
  },
];

// Composant pour les onglets de menu
function MenuTabs({
  activeMenu,
  setActiveMenu,
}: {
  activeMenu: string;
  setActiveMenu: (id: string) => void;
}) {
  return (
    <div className="flex overflow-x-auto pb-2 mb-6 scrollbar-hide" data-tour="menu-tabs">
      <div className="flex space-x-2">
        {menuStatsData.map((menu) => {
          const Icon = menu.icon;
          const isActive = activeMenu === menu.id;

          return (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-amber-600 text-white shadow-lg"
                  : "bg-amber-100/50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-200/50 dark:hover:bg-amber-800/30"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="whitespace-nowrap font-medium">
                {menu.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Composant pour les cartes de statistiques
function StatCard({ stat }: { stat: StatItem }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-5 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${stat.color}/20`}>
          <Icon className={`w-6 h-6 ${stat.color.replace("bg-", "text-")}`} />
        </div>
        {stat.change && (
          <span
            className={`text-sm font-medium ${
              typeof stat.change === "string" && stat.change.includes("+")
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {stat.change}
          </span>
        )}
      </div>

      <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-1">
        {stat.value}
      </h3>
      <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
        {stat.label}
      </p>
    </motion.div>
  );
}

// Composant pour le graphique (simplifié pour cet exemple)
function MiniChart() {
  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-5 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30 h-full" data-tour="evolution-chart">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-amber-900 dark:text-amber-100">
          Évolution
        </h3>
        <button className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300">
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-end justify-between h-32 mt-4">
        {[40, 60, 75, 55, 80, 65, 90].map((height, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div
              className="w-3/4 bg-gradient-to-t from-amber-500 to-amber-400 rounded-t"
              style={{ height: `${height}%` }}
            />
            <span className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
              {["L", "M", "M", "J", "V", "S", "D"][index]}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4 pt-4 border-t border-amber-200/30 dark:border-amber-700/30">
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            78%
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
            Moyenne
          </p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-900 dark:text-amber-100">
            +12%
          </p>
          <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
            Croissance
          </p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [activeMenu, setActiveMenu] = useState("home");
  const activeMenuData =
    menuStatsData.find((menu) => menu.id === activeMenu) || menuStatsData[0];
  const Icon = activeMenuData.icon;


  return (
    <div className="min-h-screen bg-amber-50/30 dark:bg-amber-950/10 p-6">
      {/* Header */}
      <div className="mb-8" data-tour="dashboard-header">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-amber-900 dark:text-amber-100 flex items-center"
            >
              <Icon className="w-8 h-8 mr-3" />
              {activeMenuData.title}
            </motion.h1>
            <p className="text-amber-600/70 dark:text-amber-400/70 mt-2">
              {activeMenuData.description}
            </p>
          </div>
        </div>

        <MenuTabs activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      </div>

      {/* Stats Summary */}
      <motion.div
        key={activeMenu}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-br from-amber-100 to-amber-200/50 dark:from-amber-900/30 dark:to-amber-800/20 rounded-2xl p-6 mb-8 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30"
        data-tour="stats-overview"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100">
              Vue d'ensemble
            </h2>
            <p className="text-amber-600/70 dark:text-amber-400/70">
              Performances et statistiques du module
            </p>
          </div>

          <div className="flex items-baseline mt-4 md:mt-0">
            <span className="text-3xl font-bold text-amber-900 dark:text-amber-100 mr-2">
              {activeMenuData.total}
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {activeMenuData.growth}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6" data-tour="stats-grid">
          <AnimatePresence mode="wait">
            {activeMenuData.stats.map((stat, index) => (
              <StatCard key={index} stat={stat} />
            ))}
          </AnimatePresence>
        </div>

        {/* Chart */}
        <div className="lg:col-span-1">
          <MiniChart />
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30"
          data-tour="recent-activity"
        >
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center">
            <Activity className="mr-2 w-5 h-5" />
            Activité récente
          </h2>

          <div className="space-y-4">
            {[
              {
                action: "Nouveau péage ajouté",
                module: "Péages",
                time: "Il y a 12 min",
              },
              {
                action: "Mise à jour des tarifs",
                module: "Localités",
                time: "Il y a 34 min",
              },
              {
                action: "Rapport mensuel généré",
                module: "Comptes",
                time: "Il y a 1 h",
              },
              {
                action: "Nouvel utilisateur inscrit",
                module: "Utilisateurs",
                time: "Il y a 2 h",
              },
            ].map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30"
              >
                <div className="flex items-center">
                  <div className="p-2 rounded-lg bg-amber-200/30 dark:bg-amber-700/30 mr-3">
                    <Activity className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-900 dark:text-amber-100">
                      {activity.action}
                    </p>
                    <p className="text-sm text-amber-600/70 dark:text-amber-400/70">
                      {activity.module}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-6 backdrop-blur-sm border border-amber-200/30 dark:border-amber-700/30"
          data-tour="quick-actions"
        >
          <h2 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-4">
            Actions rapides
          </h2>

          <div className="space-y-3">
            {[
              {
                label: "Générer un rapport",
                icon: FileText,
                color: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
              },
              {
                label: "Exporter les données",
                icon: Download,
                color: "bg-green-500/20 text-green-700 dark:text-green-300",
              },
              {
                label: "Voir les détails complets",
                icon: Eye,
                color: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
              },
              {
                label: "Paramètres avancés",
                icon: Settings,
                color: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
              },
            ].map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-between p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/30 dark:border-amber-700/30 hover:bg-amber-100/50 dark:hover:bg-amber-800/30 transition-all"
                >
                  <div className="flex items-center">
                    <div className={`p-2 rounded-lg ${action.color} mr-3`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-amber-900 dark:text-amber-100 text-left">
                      {action.label}
                    </span>
                  </div>
                  <div className="text-amber-600/70 dark:text-amber-400/70">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}