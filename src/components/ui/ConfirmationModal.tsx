// @/components/ui/ConfirmationModal.tsx
'use client'

import Modal from '@/components/ui/Modal'
import { AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'delete' | 'edit' | 'warning'
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  type = 'warning'
}: ConfirmationModalProps) {
  const getIconColor = () => {
    switch (type) {
      case 'delete': return 'text-red-400'
      case 'edit': return 'text-amber-400'
      default: return 'text-amber-400'
    }
  }

  const getButtonColor = () => {
    switch (type) {
      case 'delete': return 'bg-red-600 hover:bg-red-700'
      case 'edit': return 'bg-amber-600 hover:bg-amber-700'
      default: return 'bg-amber-600 hover:bg-amber-700'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4">
          <AlertTriangle size={60} className={`mx-auto ${getIconColor()}`} />
        </div>
        <h3 className="text-xl font-semibold text-amber-100 mb-2">{title}</h3>
        <p className="text-amber-200/80 mb-6">{message}</p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 text-amber-300 bg-amber-800/30 border border-amber-700/50 rounded-xl hover:bg-amber-700/40 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`px-6 py-2 text-white ${getButtonColor()} rounded-xl transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  )
}