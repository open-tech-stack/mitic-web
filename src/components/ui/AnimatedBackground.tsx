'use client'

import { useCallback } from 'react'
import Particles from 'react-tsparticles'
import { loadSlim } from 'tsparticles-slim'
import type { Engine } from 'tsparticles-engine'

export default function AnimatedBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine)
  }, [])

  return (
    <div className="fixed inset-0 z-0">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fullScreen: false,
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "grab",
                parallax: {
                  enable: true,
                  force: 30,
                  smooth: 10
                }
              },
              onClick: {
                enable: true,
                mode: "push"
              },
              resize: true
            },
            modes: {
              grab: {
                distance: 120,
                line_linked: {
                  opacity: 0.8
                }
              },
              push: {
                quantity: 3
              },
              repulse: {
                distance: 100,
                duration: 0.4
              }
            }
          },
          particles: {
            color: {
              value: ["#b45309", "#d97706", "#f59e0b", "#fbbf24"]
            },
            links: {
              color: "#b45309",
              distance: 120,
              enable: true,
              opacity: 0.4,
              width: 1.2,
              triangles: {
                enable: true,
                opacity: 0.1,
                color: "#d97706"
              }
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce"
              },
              random: true,
              speed: 1.2,
              straight: false,
              trail: {
                enable: true,
                length: 8,
                fillColor: "#0f172a"
              }
            },
            number: {
              density: {
                enable: true,
                area: 800
              },
              value: 60
            },
            opacity: {
              value: 0.7,
              animation: {
                enable: true,
                speed: 1,
                minimumValue: 0.3,
                sync: false
              }
            },
            shape: {
              type: ["circle", "triangle", "polygon"],
              polygon: {
                sides: 5
              }
            },
            size: {
              value: { 
                min: 1, 
                max: 4 
              },
              animation: {
                enable: true,
                speed: 3,
                minimumValue: 0.5,
                sync: false
              }
            },
            wobble: {
              enable: true,
              distance: 5,
              speed: 2
            }
          },
          detectRetina: true,
          motion: {
            reduce: {
              factor: 2,
              value: true
            }
          }
        }}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%'
        }}
      />
      
      {/* Overlay de dégradé pour mieux voir les particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-gray-900/30 dark:to-gray-800/20 pointer-events-none" />
    </div>
  )
}