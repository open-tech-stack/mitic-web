'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

export default function DashboardFooter() {
  return (
    <footer className="bg-transparent mt-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center p-6"
      >
        <p className="text-amber-white dark:text-amber-400/70 text-sm flex items-center justify-center">
          Fait par ATEC & ALBATROS
        </p>
        <p className="text-amber-600/50 dark:text-amber-400/50 text-xs mt-2">
          © 2025 Tous droits réservés
        </p>
      </motion.div>
    </footer>
  )
}