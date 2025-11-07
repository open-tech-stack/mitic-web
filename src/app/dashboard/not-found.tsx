'use client'

import { motion } from 'framer-motion'
import { 
  Home, 
  Search, 
  ArrowLeft, 
  MapPin, 
  Route, 
  Compass,
  Navigation,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function DashboardNotFound() {
  const [pathTrace, setPathTrace] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPathTrace(prev => (prev + 1) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const routeElements = Array.from({ length: 12 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-2 h-2 bg-amber-400/40 rounded-full"
      animate={{
        pathLength: [0, 1, 0],
        opacity: [0.2, 0.8, 0.2],
        scale: [0.5, 1.2, 0.5]
      }}
      transition={{
        duration: 3 + i * 0.2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.1
      }}
      style={{
        left: `${10 + (i * 7) % 80}%`,
        top: `${20 + Math.sin(i) * 30 + 30}%`
      }}
    />
  ))

  return (
    <div className="min-h-screen bg-amber-500/20 relative overflow-hidden p-6">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
        {routeElements}
        
        {/* Animated Route Path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <motion.path
            d="M10,50 Q30,20 50,50 T90,30"
            stroke="rgba(251,191,36,0.3)"
            strokeWidth="0.5"
            fill="none"
            strokeDasharray="2,2"
            animate={{ strokeDashoffset: [-4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Dashboard Header Simulation */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-8 p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-gray-700/30"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/30 flex items-center justify-center">
              <span className="text-amber-700 dark:text-amber-300 font-bold">M</span>
            </div>
            <span className="text-amber-900 dark:text-amber-100 font-semibold">Tableau de bord</span>
          </div>
          <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="text-sm">Itinéraire perdu</span>
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 text-center lg:text-left"
          >
            {/* Route Display */}
            <div className="mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="inline-block p-6 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/20 rounded-full mb-6"
              >
                <Navigation className="w-16 h-16 text-amber-600 dark:text-amber-400" />
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-black text-amber-900 dark:text-amber-100 mb-4">
                Itinéraire<br />
                <span className="text-amber-600 dark:text-amber-400">Non Trouvé</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-amber-700/80 dark:text-amber-300/80 mb-6">
                La destination que vous recherchez semble être hors de notre réseau de transport.
              </p>
              
              <div className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/30 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1 flex-shrink-0" />
                  <div className="text-left">
                    <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                      Suggestions de navigation :
                    </h3>
                    <ul className="text-amber-700 dark:text-amber-300 space-y-1 text-sm">
                      <li>• Vérifiez l'URL dans la barre d'adresse</li>
                      <li>• Utilisez le menu de navigation principal</li>
                      <li>• Retournez au tableau de bord</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link href="/dashboard/home">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-amber-500/25 transition-all"
                >
                  <Home className="w-5 h-5" />
                  <span>Tableau de bord</span>
                </motion.button>
              </Link>

              <Link href="/dashboard/search">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-3 px-8 py-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-amber-200 dark:border-amber-700/30 text-amber-800 dark:text-amber-200 rounded-2xl font-semibold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                >
                  <Search className="w-5 h-5" />
                  <span>Rechercher trajet</span>
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="flex items-center space-x-3 px-8 py-4 bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-semibold hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Retour</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Right Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex-1 max-w-md"
          >
            <div className="relative">
              {/* Map Illustration */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 border border-white/20 dark:border-gray-700/30 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-900 dark:text-amber-100 font-semibold">Itinéraire</span>
                    <Compass className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  
                  {/* Route Lines */}
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div className="w-3 h-3 bg-amber-400 rounded-full" />
                      <div className="flex-1 h-2 bg-gradient-to-r from-amber-200 dark:from-amber-700 to-amber-600 rounded-full relative overflow-hidden">
                        <motion.div
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent w-1/3"
                        />
                      </div>
                      <Route className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                  ))}
                  
                  {/* Error Line */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 1.2 }}
                    className="flex items-center space-x-3 p-3 bg-red-100/50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-red-700 dark:text-red-300 text-sm">Destination non accessible</span>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          {[
            { label: 'Pages disponibles', value: '12+', icon: Route },
            { label: 'Trajets actifs', value: '45', icon: Navigation },
            { label: 'Utilisateurs connectés', value: '1.2k', icon: MapPin }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700/30 text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 rounded-xl bg-amber-100/50 dark:bg-amber-900/30">
                    <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </motion.div>

        {/* Footer Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-12 text-amber-500/70 dark:text-amber-400/70 text-sm"
        >
          Gestion Peages Dashboard © 2025
        </motion.div>
      </div>
    </div>
  )
}