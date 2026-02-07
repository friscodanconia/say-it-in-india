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
  }

  const handleBack = () => {
    setView('home')
    setSelectedScene(null)
  }

  return (
    <div className="min-h-screen bg-surface">
      {view === 'home' && (
        <>
          <Hero onExplore={() => document.getElementById('scenes')?.scrollIntoView({ behavior: 'smooth' })} />

          <div id="scenes" className="max-w-5xl mx-auto px-6 py-16">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">Pick a scene</h2>
            <p className="text-zinc-400 mb-10 text-lg">Each scene sets the mood. You pick the language and voice.</p>
            <SceneSelector scenes={scenes} onSelect={handleSceneSelect} />
          </div>

          <div className="max-w-5xl mx-auto px-6 py-16 border-t border-white/5">
            <h2 className="font-display text-3xl md:text-4xl text-white mb-3">The 11-Language Relay</h2>
            <p className="text-zinc-400 mb-10 text-lg">One phrase. Eleven languages. Hit play and listen to it cascade across India.</p>
            <LanguageRelay />
          </div>

          <footer className="text-center py-12 text-zinc-600 text-sm">
            Powered by <a href="https://sarvam.ai" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">Sarvam AI</a> Bulbul TTS
          </footer>
        </>
      )}

      {view === 'scene' && selectedScene && (
        <VoiceStage scene={selectedScene} onBack={handleBack} />
      )}
    </div>
  )
}
