// src/contexts/TourContext.tsx

'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface TourContextType {
  isTourActive: boolean
  currentStep: number
  totalSteps: number
  startTour: () => void
  stopTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (step: number) => void
  hasSeenTour: boolean
  markTourAsSeen: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isTourActive, setIsTourActive] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [totalSteps, setTotalSteps] = useState(0)
  const [hasSeenTour, setHasSeenTour] = useState(false)

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà vu le tour
    const tourSeen = localStorage.getItem('dashboard-tour-completed')
    setHasSeenTour(!!tourSeen)
  }, [])

  const startTour = () => {
    setIsTourActive(true)
    setCurrentStep(0)
  }

  const stopTour = () => {
    setIsTourActive(false)
    setCurrentStep(0)
  }

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1))
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0))
  }

  const goToStep = (step: number) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)))
  }

  const markTourAsSeen = () => {
    localStorage.setItem('dashboard-tour-completed', 'true')
    setHasSeenTour(true)
  }

  return (
    <TourContext.Provider
      value={{
        isTourActive,
        currentStep,
        totalSteps,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        goToStep,
        hasSeenTour,
        markTourAsSeen
      }}
    >
      {children}
    </TourContext.Provider>
  )
}

export function useTourContext() {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error('useTourContext must be used within a TourProvider')
  }
  return context
}

// Hook pour les analytics du tour
export function useTourAnalytics() {
  const trackTourEvent = (event: string, data?: Record<string, any>) => {
    console.log('Tour Analytics:', event, data)
    // Ici vous pouvez intégrer votre système d'analytics
    // Par exemple : analytics.track('tour_' + event, data)
  }

  const trackTourStart = () => {
    trackTourEvent('started', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    })
  }

  const trackTourComplete = (completionRate: number) => {
    trackTourEvent('completed', {
      timestamp: new Date().toISOString(),
      completionRate
    })
  }

  const trackTourSkip = (stepIndex: number, totalSteps: number) => {
    trackTourEvent('skipped', {
      stepIndex,
      totalSteps,
      completionRate: stepIndex / totalSteps
    })
  }

  const trackStepView = (stepIndex: number, stepId: string, duration?: number) => {
    trackTourEvent('step_viewed', {
      stepIndex,
      stepId,
      duration,
      timestamp: new Date().toISOString()
    })
  }

  return {
    trackTourStart,
    trackTourComplete,
    trackTourSkip,
    trackStepView
  }
}