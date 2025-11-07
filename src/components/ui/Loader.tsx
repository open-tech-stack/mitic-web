'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface LoaderProps {
  isVisible?: boolean
  message?: string
  variant?: 'page' | 'navigation'
}

export default function Loader({ 
  isVisible = true, 
  message = "Chargement...", 
  variant = 'page' 
}: LoaderProps) {
  const lottieRef = useRef<any>(null)

  useEffect(() => {
    let animationInstance: any = null

    const loadLottie = async () => {
      try {
        // Dynamically import lottie-web only when needed
        const lottie = (await import('lottie-web')).default
        
        if (lottieRef.current && !animationInstance) {
          animationInstance = lottie.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: '/animations/loader.json',
          })
        }
      } catch (error) {
        console.warn('Lottie animation could not be loaded:', error)
        // Fallback will be shown instead
      }
    }

    if (isVisible) {
      loadLottie()
    }

    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [isVisible])

  const pageVariant = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const navigationVariant = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 }
  }

  const currentVariant = variant === 'page' ? pageVariant : navigationVariant

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={currentVariant.initial}
          animate={currentVariant.animate}
          exit={currentVariant.exit}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={`
            fixed inset-0 z-50 flex flex-col items-center justify-center
            ${variant === 'page' 
              ? 'bg-gradient-to-br from-amber-50 to-amber-100 dark:from-gray-900 dark:to-gray-800' 
              : 'bg-gray-900/80 backdrop-blur-sm'
            }
          `}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_50%)]"></div>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,rgba(251,191,36,0.05)_60deg,transparent_120deg)]"></div>
          </div>

          {/* Main Loader Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col items-center space-y-6"
          >
            {/* Logo/Brand */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-xl">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                </span>
              </div>
              {variant === 'page' && (
                <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  Gestion Peages
                </span>
              )}
            </motion.div>

            {/* Lottie Animation Container */}
            <div className="relative">
              {/* Lottie Animation */}
              <div 
                ref={lottieRef}
                className="w-24 h-24"
                style={{ filter: 'hue-rotate(25deg) saturate(1.2)' }}
              />
              
              {/* Fallback Animation (if Lottie fails) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-20 h-20 rounded-full border-4 border-amber-200/30 dark:border-amber-700/30 border-t-amber-600 dark:border-t-amber-400"
                />
              </div>
              
              {/* Outer Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-2 rounded-full border border-amber-300/20 dark:border-amber-600/20"
              />
              
              {/* Pulsing Glow */}
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-xl"
              />
            </div>

            {/* Loading Text */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-center space-y-2"
            >
              <p className="text-lg font-medium text-amber-900 dark:text-amber-100">
                {message}
              </p>
              
              {/* Loading Dots */}
              <div className="flex items-center justify-center space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut"
                    }}
                    className="w-2 h-2 bg-amber-600 dark:bg-amber-400 rounded-full"
                  />
                ))}
              </div>
              
              {variant === 'page' && (
                <p className="text-sm text-amber-600/70 dark:text-amber-400/70 mt-4">
                  Préparation de votre espace...
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Bottom Branding */}
          {variant === 'page' && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute bottom-8 text-center"
            >
              <p className="text-amber-600/50 dark:text-amber-400/50 text-sm">
                Fait par ATEC & ALBATROS
              </p>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}