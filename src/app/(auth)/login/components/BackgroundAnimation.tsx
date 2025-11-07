'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

// Génère des valeurs déterministes basées sur l'index
const generateDeterministicValues = (index: number) => {
  // Utilisation d'une fonction pseudo-aléatoire déterministe
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed * 1000) * 10000
    return x - Math.floor(x)
  }

  const seed = index * 123.456 // Seed différente pour chaque particule
  
  return {
    initialX: pseudoRandom(seed) * 100,
    initialY: pseudoRandom(seed + 1) * 100,
    initialScale: pseudoRandom(seed + 2) * 1.5 + 0.5,
    keyframesX: [
      pseudoRandom(seed + 3) * 100,
      pseudoRandom(seed + 4) * 100,
      pseudoRandom(seed + 5) * 100
    ],
    keyframesY: [
      pseudoRandom(seed + 6) * 100,
      pseudoRandom(seed + 7) * 100,
      pseudoRandom(seed + 8) * 100
    ],
    duration: pseudoRandom(seed + 9) * 30 + 20
  }
}

export default function BackgroundAnimation() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Ne pas rendre l'animation pendant l'hydratation SSR
  if (!isMounted) {
    return (
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Version statique pour SSR - éléments invisibles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-amber-500/20 opacity-0"
          />
        ))}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-700/10 blur-xl opacity-0" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-600/10 blur-xl opacity-0" />
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-700/30 to-transparent opacity-0" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-600/30 to-transparent opacity-0" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Particules animées - version client seulement */}
      {[...Array(15)].map((_, i) => {
        const values = generateDeterministicValues(i)
        
        return (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-amber-500/20"
            initial={{
              x: `${values.initialX}vw`,
              y: `${values.initialY}vh`,
              scale: values.initialScale,
            }}
            animate={{
              x: [
                `${values.keyframesX[0]}vw`,
                `${values.keyframesX[1]}vw`,
                `${values.keyframesX[2]}vw`,
              ],
              y: [
                `${values.keyframesY[0]}vh`,
                `${values.keyframesY[1]}vh`,
                `${values.keyframesY[2]}vh`,
              ],
            }}
            transition={{
              duration: values.duration,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )
      })}
      
      {/* Formes géométriques */}
      <motion.div
        className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-700/10 blur-xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      <motion.div
        className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-600/10 blur-xl"
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
      
      {/* Lignes animées */}
      <motion.div
        className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-700/30 to-transparent"
        animate={{
          height: ['0%', '100%', '0%'],
          top: ['100%', '0%', '100%'],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-amber-600/30 to-transparent"
        animate={{
          height: ['100%', '0%', '100%'],
          top: ['0%', '100%', '0%'],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  )
}