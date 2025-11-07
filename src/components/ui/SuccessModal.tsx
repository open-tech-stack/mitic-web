'use client'

import Modal from '@/components/ui/Modal'
import { LaptopMinimalCheck } from 'lucide-react'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 h-24 w-24">
          <LaptopMinimalCheck size={100} className="text-amber-100" color='green'/>
        </div>
        <h3 className="text-xl font-semibold text-amber-100">Connexion réussie !</h3>
        <p className="mt-2 text-amber-200/80">Redirection en cours...</p>
      </div>
    </Modal>
  )
}