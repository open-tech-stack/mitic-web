// @/components/ui/ErrorModal.tsx
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'

interface ErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
}

export default function ErrorModal({ isOpen, onClose, title = "Erreur", message }: ErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="rounded-3xl bg-gradient-to-br from-red-900/30 to-red-800/20 p-1 shadow-2xl backdrop-blur-sm">
              <div className="rounded-2xl bg-gray-900/90 p-6 backdrop-blur-md">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="rounded-xl bg-red-600/20 p-2 mr-3">
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-red-100">{title}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-red-400/70 hover:text-red-300 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-red-200/80 mb-6 leading-relaxed">
                  {message}
                </p>
                
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="px-6 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded-lg transition-colors"
                  >
                    Fermer
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}