"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface DashboardHeaderProps {
  sidebarCollapsed: boolean;
}

export default function DashboardHeader({
  sidebarCollapsed,
}: DashboardHeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();

  // Le hook useAuth
  const { logout, user } = useAuth();

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      setIsProfileOpen(false);
      await logout();
      // Redirection vers la page de login
      router.push("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 ${
        sidebarCollapsed ? "lg:left-16" : "lg:left-64"
      } z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 dark:bg-gray-800/80 dark:border-gray-700/30 transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Menu
            className="w-5 h-5 text-amber-700 dark:text-amber-300"
            size={24}
          />
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            className="hidden md:flex items-center bg-white/50 dark:bg-gray-700/50 rounded-xl px-3 py-2 shadow-sm"
          >
            <Search className="w-4 h-4 text-amber-600 dark:text-amber-400 mr-2" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="bg-transparent border-none outline-none text-sm text-amber-900 dark:text-amber-100 placeholder-amber-600/60 dark:placeholder-amber-400/60"
            />
          </motion.div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl bg-amber-100/50 hover:bg-amber-200/50 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 transition-colors"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            ) : (
              <Moon className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            )}
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-xl bg-amber-100/50 hover:bg-amber-200/50 dark:bg-amber-900/30 dark:hover:bg-amber-800/30 transition-colors relative"
          >
            <Bell className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </motion.button>

          {/* Profile Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="p-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 transition-colors"
            >
              <User className="w-5 h-5 text-amber-700 dark:text-amber-300" />
            </motion.button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/30 p-2"
                >
                  <div className="p-3 border-b border-amber-100/20 dark:border-amber-800/20">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Nestor
                    </p>
                    <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                      admin@gmail.com
                    </p>
                  </div>

                  <button className="w-full flex items-center space-x-2 p-3 rounded-xl hover:bg-amber-100/30 dark:hover:bg-amber-900/30 transition-colors">
                    <Settings className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                    <span className="text-sm text-amber-900 dark:text-amber-100">
                      Paramètres
                    </span>
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 p-3 rounded-xl hover:bg-amber-100/30 dark:hover:bg-amber-900/30 transition-colors text-red-600 dark:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Déconnexion</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
