'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  ChevronRight, 
  Play, 
  Pause, 
  RotateCcw,
  Lightbulb,
  Target,
  Eye
} from 'lucide-react'

// Types
export interface TourStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'center'
  action?: 'click' | 'hover' | 'scroll'
  actionText?: string
  optional?: boolean
}

interface TourGuideProps {
  isOpen: boolean
  onClose: () => void
  steps: TourStep[]
  onComplete?: () => void
  autoStart?: boolean
}

// Hook pour gérer le tour
export function useTourGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tour
    const tourSeen = localStorage.getItem('dashboard-tour-seen')
    setHasSeenTour(!!tourSeen)

    // Écouter le raccourci Ctrl+G
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [])

  const startTour = () => setIsOpen(true)
  const closeTour = () => {
    setIsOpen(false)
    if (!hasSeenTour) {
      localStorage.setItem('dashboard-tour-seen', 'true')
      setHasSeenTour(true)
    }
  }

  const resetTour = () => {
    localStorage.removeItem('dashboard-tour-seen')
    setHasSeenTour(false)
  }

  return {
    isOpen,
    hasSeenTour,
    startTour,
    closeTour,
    resetTour
  }
}

// Composant principal du tour
export default function TourGuide({ 
  isOpen, 
  onClose, 
  steps, 
  onComplete,
  autoStart = false 
}: TourGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoStart)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isOpen) return

    updateTargetPosition()
    const handleResize = () => updateTargetPosition()
    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', updateTargetPosition)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isOpen, currentStep])

  useEffect(() => {
    if (isPlaying && isOpen) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 4000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, isOpen, steps.length])

  const updateTargetPosition = () => {
    const target = document.querySelector(`[data-tour="${steps[currentStep]?.target}"]`)
    if (target) {
      // Scroll d'abord
      scrollElementIntoView()
      
      // Attendre que le scroll soit terminé avant de calculer la position
      setTimeout(() => {
        const rect = target.getBoundingClientRect()
        setTargetRect(rect)
        
        // Ajouter une classe pour highlighter l'élément
        target.classList.add('tour-highlighted')
        
        // Nettoyer les autres éléments
        document.querySelectorAll('.tour-highlighted').forEach(el => {
          if (el !== target) {
            el.classList.remove('tour-highlighted')
          }
        })
      }, 100)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTour()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const completeTour = () => {
    // Nettoyer tous les éléments highlighted
    document.querySelectorAll('.tour-highlighted').forEach(el => {
      el.classList.remove('tour-highlighted')
    })
    onComplete?.()
    onClose()
  }

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      completeTour()
    }
  }

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleEscapeKey)
      return () => window.removeEventListener('keydown', handleEscapeKey)
    }
  }, [isOpen])

  // Nettoyer quand le composant se démonte
  useEffect(() => {
    return () => {
      document.querySelectorAll('.tour-highlighted').forEach(el => {
        el.classList.remove('tour-highlighted')
      })
    }
  }, [])

  const getTooltipPosition = () => {
    if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

    const { top, left, width, height } = targetRect
    const tooltipOffset = 20

    switch (steps[currentStep]?.position) {
      case 'top':
        return {
          top: `${top - tooltipOffset}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, -100%)'
        }
      case 'bottom':
        return {
          top: `${top + height + tooltipOffset}px`,
          left: `${left + width / 2}px`,
          transform: 'translate(-50%, 0)'
        }
      case 'left':
        return {
          top: `${top + height / 2}px`,
          left: `${left - tooltipOffset}px`,
          transform: 'translate(-100%, -50%)'
        }
      case 'right':
        return {
          top: `${top + height / 2}px`,
          left: `${left + width + tooltipOffset}px`,
          transform: 'translate(0, -50%)'
        }
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        }
    }
  }

  const getSpotlightStyle = () => {
    if (!targetRect) return {}

    const { top, left, width, height } = targetRect
    const padding = 12

    return {
      top: `${top - padding}px`,
      left: `${left - padding}px`,
      width: `${width + padding * 2}px`,
      height: `${height + padding * 2}px`
    }
  }

  const scrollElementIntoView = () => {
    const target = document.querySelector(`[data-tour="${steps[currentStep]?.target}"]`)
    if (target) {
      // Scroll plus agressif pour s'assurer que l'élément est visible
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center' 
      })
      
      // Attendre un peu puis forcer un second scroll si nécessaire
      setTimeout(() => {
        const rect = target.getBoundingClientRect()
        const isVisible = (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= window.innerHeight &&
          rect.right <= window.innerWidth
        )
        
        if (!isVisible) {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'center' 
          })
        }
      }, 300)
    }
  }

  if (!isOpen || !steps[currentStep]) return null

  const currentStepData = steps[currentStep]

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999]">
        {/* Overlay sombre avec découpe */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{
            background: targetRect 
              ? `
                radial-gradient(
                  ellipse ${targetRect.width + 40}px ${targetRect.height + 40}px at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px,
                  transparent 0%,
                  transparent 40%,
                  rgba(0, 0, 0, 0.85) 70%,
                  rgba(0, 0, 0, 0.9) 100%
                )
              `
              : 'rgba(0, 0, 0, 0.85)'
          }}
        />

        {/* Spotlight brillant sur l'élément cible */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute rounded-2xl"
            style={{
              ...getSpotlightStyle(),
              boxShadow: `
                0 0 0 4px rgba(251, 191, 36, 0.8),
                0 0 0 8px rgba(251, 191, 36, 0.4),
                0 0 20px rgba(251, 191, 36, 0.6),
                0 0 40px rgba(251, 191, 36, 0.3),
                inset 0 0 20px rgba(255, 255, 255, 0.1)
              `,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '2px solid rgba(251, 191, 36, 0.9)',
              backdropFilter: 'blur(1px)'
            }}
          >
            {/* Effet de pulsation */}
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.02, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 rounded-2xl bg-amber-400/20"
            />
            
            {/* Coins brillants */}
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
            <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 rounded-full shadow-lg shadow-amber-400/50" />
          </motion.div>
        )}

        {/* Tooltip */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, type: 'spring', damping: 25 }}
          className="absolute w-80 max-w-[90vw]"
          style={getTooltipPosition()}
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-3xl p-6 shadow-2xl border border-amber-200/30 dark:border-amber-700/30 backdrop-blur-xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-200/30 dark:bg-amber-700/30">
                  <Lightbulb className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                </div>
                <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                  Étape {currentStep + 1} sur {steps.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contenu */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                {currentStepData.title}
              </h3>
              <p className="text-amber-600/80 dark:text-amber-400/80 text-sm leading-relaxed">
                {currentStepData.description}
              </p>
              
              {currentStepData.actionText && (
                <div className="mt-3 p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-xl border border-amber-200/30 dark:border-amber-700/30">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="text-sm text-amber-700 dark:text-amber-300">
                      {currentStepData.actionText}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Progress bar */}
            <div className="mb-4">
              <div className="flex space-x-1">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`h-2 rounded-full flex-1 transition-all ${
                      index === currentStep
                        ? 'bg-amber-500'
                        : index < currentStep
                        ? 'bg-amber-300'
                        : 'bg-amber-200/50 dark:bg-amber-800/30'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-2 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-600 dark:text-amber-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setCurrentStep(0)
                    setIsPlaying(false)
                  }}
                  className="px-3 py-2 text-sm text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-800/30 rounded-xl transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={currentStep === steps.length - 1 ? completeTour : nextStep}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all flex items-center space-x-2"
                >
                  <span>{currentStep === steps.length - 1 ? 'Terminer' : 'Suivant'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bouton d'aide flottant avec plus d'infos */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-6 z-10"
        >
          <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-4 shadow-2xl border border-amber-200/30 dark:border-amber-700/30 backdrop-blur-xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Eye className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity
                  }}
                  className="absolute inset-0 rounded-full bg-amber-400/30"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Tour guidé actif
                </p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70">
                  Suivez le contour doré • Échap pour quitter
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Style CSS pour l'élément highlighted */}
        <style jsx global>{`
          .tour-highlighted {
            position: relative !important;
            z-index: 9998 !important;
          }
          
          .tour-highlighted::before {
            content: '';
            position: absolute;
            inset: -8px;
            border: 3px solid rgba(251, 191, 36, 0.8);
            border-radius: 16px;
            background: rgba(251, 191, 36, 0.1);
            box-shadow: 
              0 0 20px rgba(251, 191, 36, 0.4),
              inset 0 0 20px rgba(255, 255, 255, 0.1);
            pointer-events: none;
            z-index: -1;
            animation: tourPulse 2s ease-in-out infinite;
          }
          
          @keyframes tourPulse {
            0%, 100% {
              transform: scale(1);
              opacity: 0.8;
            }
            50% {
              transform: scale(1.02);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    </AnimatePresence>
  )
}

// Composant pour le bouton de démarrage du tour
export function TourStartButton({ onStart, className = '' }: { onStart: () => void, className?: string }) {
  return (
    <motion.button
      onClick={onStart}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.55 }}
      className={`group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl ${className}`}
    >
      <Lightbulb className="w-4 h-4 group-hover:animate-pulse" />
    </motion.button>
  )
}

// Composant pour les notifications de raccourci
export function TourShortcutHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        className="fixed top-20 right-6 z-50"
      >
        <div className="bg-gradient-to-br from-white to-amber-50 dark:from-gray-800 dark:to-amber-900/20 rounded-2xl p-4 shadow-xl border border-amber-200/30 dark:border-amber-700/30 backdrop-blur-xl max-w-xs">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Astuce
                </span>
              </div>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80">
                Appuyez sur <kbd className="px-2 py-1 bg-amber-200/50 dark:bg-amber-800/30 rounded text-xs font-mono">Ctrl+G</kbd> pour accéder au tour guidé
              </p>
            </div>
            <button
              onClick={() => setShow(false)}
              className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-800/30 text-amber-600/70 dark:text-amber-400/70"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}