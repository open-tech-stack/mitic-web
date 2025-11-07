'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md rounded-3xl bg-gradient-to-br from-amber-900/90 to-amber-800/80 p-1 shadow-2xl"
          >
            <div className="rounded-2xl bg-gray-900/90 backdrop-blur-md p-6">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 rounded-full p-1 text-amber-200/70 transition-all hover:text-amber-100 hover:bg-amber-800/30"
              >
                <X size={20} />
              </button>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}