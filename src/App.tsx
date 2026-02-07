import { useState, useEffect, useRef, useCallback } from 'react'
import { Hero } from './components/Hero'
import { SceneSelector } from './components/SceneSelector'
import { VoiceStage } from './components/VoiceStage'
import { LanguageRelay } from './components/LanguageRelay'
import { scenes } from './data/scenes'
import type { Scene } from './data/scenes'

type View = 'home' | 'scene' | 'relay'

function useFadeIn() {
  const observerRef = useRef<IntersectionObserver | null>(null)

  if (!observerRef.current) {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -20px 0px' }
    )
  }

  useEffect(() => {
    return () => observerRef.current?.disconnect()
  }, [])

  const setRef = useCallback((_index: number) => (el: HTMLElement | null) => {
    if (el && observerRef.current) {
      observerRef.current.observe(el)
    }
  }, [])

  return setRef
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)
  const setRef = useFadeIn()

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene)
    setView('scene')
    window.scrollTo({ top: 0 })
  }

  const handleBack = () => {
    setView('home')
    setSelectedScene(null)
  }

  return (
    <div className="min-h-screen bg-surface grain">
      {view === 'home' && (
        <>
          <Hero onExplore={() => document.getElementById('scenes')?.scrollIntoView({ behavior: 'smooth' })} />

          {/* Divider */}
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent" />
          </div>

          <section ref={setRef(0)} id="scenes" className="fade-section max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-24">
            <div className="mb-10 sm:mb-16">
              <p className="font-body text-warm-700 text-sm uppercase tracking-[0.2em] mb-4 font-medium">Choose Your Moment</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-warm-900 font-light leading-tight">
                Pick a scene
              </h2>
              <p className="text-warm-800 mt-4 max-w-lg text-base leading-relaxed">
                Each scene carries its own emotion. You choose the language and voice — and the same words transform.
              </p>
            </div>
            <SceneSelector scenes={scenes} onSelect={handleSceneSelect} />
          </section>

          {/* Divider */}
          <div className="max-w-6xl mx-auto px-5 sm:px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-300/40 to-transparent" />
          </div>

          <section ref={setRef(1)} className="fade-section max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-24">
            <div className="mb-10 sm:mb-16">
              <p className="font-body text-warm-700 text-sm uppercase tracking-[0.2em] mb-4 font-medium">The Cascade</p>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-warm-900 font-light leading-tight">
                The 11-Language Relay
              </h2>
              <p className="text-warm-800 mt-4 max-w-lg text-base leading-relaxed">
                One phrase. Eleven languages. Hit play and listen to the same thought ripple across India.
              </p>
            </div>
            <LanguageRelay />
          </section>

          <footer ref={setRef(2)} className="fade-section max-w-6xl mx-auto px-5 sm:px-8 py-16">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-300/30 to-transparent mb-12" />
            <div className="flex items-center justify-between">
              <p className="font-display text-lg text-warm-600 italic">Say It In India</p>
              <p className="text-warm-700 text-sm tracking-wider font-medium">
                Powered by <a href="https://sarvam.ai" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover transition-colors duration-500 font-medium">Sarvam AI</a> Bulbul TTS
              </p>
            </div>
          </footer>
        </>
      )}

      {view === 'scene' && selectedScene && (
        <VoiceStage scene={selectedScene} onBack={handleBack} />
      )}
    </div>
  )
}
