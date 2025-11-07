'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ForgotPasswordTooltip() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-sm text-amber-400/80 hover:text-amber-300 transition-colors"
      >
        <HelpCircle size={16} className="mr-1" />
        Mot de passe oublié ?
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-8 z-50 w-72 rounded-2xl bg-gradient-to-br from-amber-900 to-amber-800 p-1 shadow-xl"
          >
            <div className="rounded-xl bg-gray-900 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-2 top-2 rounded-full p-1 text-amber-200/70 hover:text-amber-100"
              >
                <X size={16} />
              </button>
              <h3 className="mb-2 font-semibold text-amber-200">Assistance</h3>
              <p className="text-sm text-amber-200/80">
                Veuillez contacter l'administrateur au
              </p>
              <a
                href="tel:+22665000000"
                className="mt-2 block text-lg font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                +226 65 00 00 00
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}