'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Lock, ArrowLeft, LogIn, UserPlus, Shield } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function AuthNotFound() {
  const [glitchActive, setGlitchActive] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true)
      setTimeout(() => setGlitchActive(false), 200)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const securityElements = Array.from({ length: 6 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-8 bg-amber-500/20 h-8 border border-red-400/20 rounded"
      animate={{
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 0.8, 1.2, 0.9, 1],
        opacity: [0.2, 0.6, 0.3, 0.8, 0.2]
      }}
      transition={{
        duration: 8 + i,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.5
      }}
      style={{
        left: `${15 + i * 12}%`,
        top: `${20 + (i % 2) * 40}%`
      }}
    />
  ))

  return (
    <div className="min-h-screen bg-amber-500/20 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(239,68,68,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_49%,rgba(239,68,68,0.05)_50%,transparent_51%)]" />
        {securityElements}
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* Security Warning Icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 200 }}
          className="relative mb-8"
        >
          <motion.div
            animate={{ 
              boxShadow: glitchActive 
                ? ["0 0 20px rgba(239,68,68,0.5)", "0 0 40px rgba(239,68,68,0.8)", "0 0 20px rgba(239,68,68,0.5)"]
                : "0 0 20px rgba(239,68,68,0.3)"
            }}
            transition={{ duration: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center"
          >
            <Lock className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -inset-4 border-2 border-red-400/30 rounded-full"
          />
        </motion.div>

        {/* 404 with Glitch Effect */}
        <AnimatePresence>
          <motion.div
            key={glitchActive ? "glitch" : "normal"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="relative mb-6"
          >
            <h1 
              className={`text-8xl md:text-9xl font-black select-none ${
                glitchActive 
                  ? 'text-red-500 transform skew-x-2' 
                  : 'text-red-400/60'
              }`}
            >
              4<span className={glitchActive ? 'text-white' : ''}>0</span>4
            </h1>
          </motion.div>
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Shield className="w-8 h-8 text-red-400" />
            Accès Refusé
          </h2>
          <p className="text-lg md:text-xl text-gray-300 mb-6">
            Cette zone d'authentification est sécurisée. La page demandée n'existe pas ou vous n'avez pas l'autorisation d'y accéder.
          </p>
          <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-8">
            <p className="text-red-300 text-sm">
              <strong>Code d'erreur :</strong> AUTH_404_SECURE_ZONE
            </p>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold shadow-2xl hover:shadow-red-500/25 transition-all"
            >
              <LogIn className="w-5 h-5" />
              <span>Se connecter</span>
            </motion.button>
          </Link>

          <Link href="/register">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl font-semibold hover:bg-white/20 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              <span>Créer un compte</span>
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="flex items-center space-x-3 px-6 py-3 bg-gray-800/80 backdrop-blur-sm border border-gray-600/50 text-gray-300 rounded-xl font-semibold hover:bg-gray-700/80 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </motion.button>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-12 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl max-w-md mx-auto"
        >
          <p className="text-yellow-300 text-sm flex items-start space-x-2">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Cette zone est protégée par les systèmes de sécurité de l'Admin. 
              Toutes les tentatives d'accès sont enregistrées.
            </span>
          </p>
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-gray-500 text-sm"
        >
          Gestion de Peages Security © 2025
        </motion.div>
      </div>
    </div>
  )
}