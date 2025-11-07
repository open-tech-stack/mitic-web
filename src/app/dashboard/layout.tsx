"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardFooter from "@/components/dashboard/DashboardFooter";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import ChatSupport from "@/components/dashboard/ChatSupport";
import TourGuide, {
  useTourGuide,
  TourStartButton,
  TourShortcutHint,
} from "@/components/tour/TourGuide";
import {
  dashboardHomeTourSteps,
  newUserWelcomeSteps,
} from "@/config/dashboardHomeTour";
import { Toaster } from "react-hot-toast";
import { AuthGuard } from "@/components/guards/AuthGuard";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  const { user, hasPermission } = useAuth();

  const {
    isOpen: isTourOpen,
    hasSeenTour,
    startTour,
    closeTour,
  } = useTourGuide();

  useEffect(() => {
    // Vérifier si c'est la première visite
    const firstVisit = !localStorage.getItem("dashboard-visited");
    setIsFirstVisit(firstVisit);

    // Marquer comme visité
    if (firstVisit) {
      localStorage.setItem("dashboard-visited", "true");
    }

    // Délai pour que tout se charge ensemble
    const timer = setTimeout(() => {
      setIsLoaded(true);

      // Auto-démarrer le tour pour les nouveaux utilisateurs après un petit délai
      if (firstVisit && !hasSeenTour) {
        setTimeout(() => {
          startTour();
        }, 1500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [hasSeenTour, startTour]);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleOpenSidebar = () => {
    setSidebarOpen(true);
  };

  const handleTourComplete = () => {
    console.log("Tour terminé avec succès!");
  };

  // Choisir les étapes selon le type d'utilisateur
  const tourSteps = isFirstVisit ? newUserWelcomeSteps : dashboardHomeTourSteps;

  return (
    <AuthGuard requireAuth={true}>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative flex min-h-screen z-10">
          {/* Sidebar Desktop */}
          <AnimatePresence>
            {isLoaded && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  type: "spring",
                  damping: 25,
                  stiffness: 300,
                }}
                className={`hidden lg:block ${
                  sidebarCollapsed ? "w-20" : "w-64"
                } transition-all duration-300 flex-shrink-0`}
                data-tour="dashboard-sidebar"
              >
                <DashboardSidebar
                  isCollapsed={sidebarCollapsed}
                  onToggle={handleToggleSidebar}
                  onClose={handleCloseSidebar}
                  user={user}
                  hasPermission={hasPermission}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sidebar Mobile */}
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
              >
                <DashboardSidebar
                  isCollapsed={sidebarCollapsed}
                  onToggle={handleToggleSidebar}
                  onClose={handleCloseSidebar}
                  user={user}
                  hasPermission={hasPermission}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Header */}
            <AnimatePresence>
              {isLoaded && (
                <motion.div
                  initial={{ y: -100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                  data-tour="dashboard-header"
                >
                  <DashboardHeader 
                    sidebarCollapsed={sidebarCollapsed}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bouton Tour Guide pour les utilisateurs récurrents */}
            {isLoaded && hasSeenTour && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute top-20 right-6 z-40"
                >
                  <TourStartButton
                    onStart={startTour}
                    className="shadow-lg hover:shadow-xl"
                  />
                </motion.div>
              </AnimatePresence>
            )}

            {/* Content Area */}
            <main className="flex-1 pt-16 lg:pt-20 p-4 lg:p-6">
              <AnimatePresence>
                {isLoaded && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: 0.4,
                      type: "spring",
                      damping: 25,
                      stiffness: 300,
                    }}
                    className="rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20 dark:bg-gray-800/80 dark:border-gray-700/30 min-h-[calc(100vh-10rem)]"
                  >
                    {children}
                  </motion.div>
                )}
              </AnimatePresence>
            </main>

            {/* Footer */}
            <AnimatePresence>
              {isLoaded && (
                <motion.div
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    duration: 0.5,
                    delay: 0.6,
                    type: "spring",
                    damping: 25,
                    stiffness: 300,
                  }}
                >
                  <DashboardFooter />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Support */}
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.8,
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              data-tour="chat-support"
            >
              <ChatSupport />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tour Guide */}
        <TourGuide
          isOpen={isTourOpen}
          onClose={closeTour}
          steps={tourSteps}
          onComplete={handleTourComplete}
          autoStart={isFirstVisit}
        />

        {/* Hint pour le raccourci Ctrl+G */}
        {hasSeenTour && <TourShortcutHint />}

        {/* Toast Provider */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1f2937",
              color: "#fef3c7",
              border: "1px solid rgba(251, 191, 36, 0.3)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </AuthGuard>
  );
}