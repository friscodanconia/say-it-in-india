import { useState } from 'react'
import { Hero } from './components/Hero'
import { SceneSelector } from './components/SceneSelector'
import { VoiceStage } from './components/VoiceStage'
import { LanguageRelay } from './components/LanguageRelay'
import { scenes } from './data/scenes'
import type { Scene } from './data/scenes'

type View = 'home' | 'scene' | 'relay'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [selectedScene, setSelectedScene] = useState<Scene | null>(null)

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
          <div className="max-w-6xl mx-auto px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-700/30 to-transparent" />
          </div>

          <section id="scenes" className="max-w-6xl mx-auto px-8 py-24">
            <div className="mb-16">
              <p className="font-body text-warm-500 text-xs uppercase tracking-[0.2em] mb-4">Choose Your Moment</p>
              <h2 className="font-display text-4xl md:text-5xl text-warm-50 font-light leading-tight">
                Pick a scene
              </h2>
              <p className="text-stone-500 mt-4 max-w-lg text-[15px] leading-relaxed">
                Each scene carries its own emotion. You choose the language and voice — and the same words transform.
              </p>
            </div>
            <SceneSelector scenes={scenes} onSelect={handleSceneSelect} />
          </section>

          {/* Divider */}
          <div className="max-w-6xl mx-auto px-8">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-700/30 to-transparent" />
          </div>

          <section className="max-w-6xl mx-auto px-8 py-24">
            <div className="mb-16">
              <p className="font-body text-warm-500 text-xs uppercase tracking-[0.2em] mb-4">The Cascade</p>
              <h2 className="font-display text-4xl md:text-5xl text-warm-50 font-light leading-tight">
                The 11-Language Relay
              </h2>
              <p className="text-stone-500 mt-4 max-w-lg text-[15px] leading-relaxed">
                One phrase. Eleven languages. Hit play and listen to the same thought ripple across India.
              </p>
            </div>
            <LanguageRelay />
          </section>

          <footer className="max-w-6xl mx-auto px-8 py-16">
            <div className="h-px bg-gradient-to-r from-transparent via-warm-700/20 to-transparent mb-12" />
            <div className="flex items-center justify-between">
              <p className="font-display text-lg text-warm-800 italic">Say It In India</p>
              <p className="text-stone-600 text-xs tracking-wider">
                Powered by <a href="https://sarvam.ai" target="_blank" rel="noopener noreferrer" className="text-warm-600 hover:text-warm-400 transition-colors duration-500">Sarvam AI</a> Bulbul TTS
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
