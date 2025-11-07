'use client'

import { motion } from 'framer-motion'
import { Home, ArrowLeft, Search, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const floatingElements = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-4 h-4 bg-amber-400/20 rounded-full"
      animate={{
        x: [0, 50, 0, -30, 0],
        y: [0, -30, -60, -20, 0],
        scale: [1, 1.2, 0.8, 1.1, 1],
        opacity: [0.3, 0.7, 0.4, 0.8, 0.3]
      }}
      transition={{
        duration: 6 + i * 0.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay: i * 0.3
      }}
      style={{
        left: `${20 + i * 10}%`,
        top: `${30 + (i % 3) * 20}%`
      }}
    />
  ))

  return (
    <div className="min-h-screen bg-amber-900/50 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(251,191,36,0.05),transparent_50%)]" />
        {floatingElements}
      </div>

      {/* Mouse follower */}
      <motion.div
        className="absolute w-6 h-6 bg-amber-400/10 rounded-full pointer-events-none z-10"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-6 text-center">
        {/* 404 Number with Animation */}
        <motion.div
          initial={{ scale: 0, rotateY: 180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 200 }}
          className="relative"
        >
          <h1 className="text-[12rem] md:text-[16rem] font-black text-amber-600/20 select-none">
            404
          </h1>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-amber-300/30 rounded-full"
          />
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Page introuvable
          </h2>
          <p className="text-xl md:text-2xl text-gray-300 mb-8">
            Oups ! La page que vous recherchez semble avoir disparu dans les méandres du web.
          </p>
          <p className="text-lg text-gray-500/70 mb-12">
            Ne vous inquiétez pas, même nos meilleurs agents se perdent parfois !
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-wrap gap-4 justify-center"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-amber-700 to-amber-900 text-white rounded-2xl font-semibold shadow-2xl hover:shadow-amber-500/25 transition-all"
            >
              <Home className="w-5 h-5" />
              <span>Retour à l'accueil</span>
            </motion.button>
          </Link>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="flex items-center space-x-3 px-8 py-4 bg-white/80 backdrop-blur-sm border-2 border-amber-200 text-amber-800 rounded-2xl font-semibold hover:bg-amber-50 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Page précédente</span>
          </motion.button>
        </motion.div>

        {/* Bottom Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mt-16 flex flex-wrap gap-8 justify-center text-amber-600/70"
        >
          <Link href="/contact" className="flex items-center space-x-2 hover:text-amber-700 transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Besoin d'aide ?</span>
          </Link>
          <Link href="/search" className="flex items-center space-x-2 hover:text-amber-700 transition-colors">
            <Search className="w-4 h-4" />
            <span>Rechercher</span>
          </Link>
        </motion.div>

        {/* Brand */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-amber-500/50 text-sm"
        >
          Gestion Peages © 2025
        </motion.div>
      </div>
    </div>
  )
}