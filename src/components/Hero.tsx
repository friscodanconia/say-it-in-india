import { useState, useEffect } from 'react'

interface HeroProps {
  onExplore: () => void
}

const hookPhrases = [
  { question: "A bedtime story, whispered in Hindi", script: 'एक बार की बात है...', scriptLang: 'हिन्दी' },
  { question: "A love letter, read aloud in Bengali", script: 'তুমি আমায় খুব মনে পড়ো', scriptLang: 'বাংলা' },
  { question: "Cricket commentary, electrifying in Tamil", script: 'என்ன ஒரு ஆட்டம்!', scriptLang: 'தமிழ்' },
  { question: "A grandmother's recipe, patient in Malayalam", script: 'ആദ്യം നെയ്യ് ചൂടാക്കുക', scriptLang: 'മലയാളം' },
  { question: "A train announcement, unmistakable in Telugu", script: 'రైలు వచ్చేస్తోంది', scriptLang: 'తెలుగు' },
]

export function Hero({ onExplore }: HeroProps) {
  const [phraseIndex, setPhraseIndex] = useState(Math.floor(Math.random() * hookPhrases.length))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setPhraseIndex(i => (i + 1) % hookPhrases.length)
        setVisible(true)
      }, 600)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const phrase = hookPhrases[phraseIndex]

  return (
    <section className="min-h-[85vh] sm:min-h-[90vh] flex flex-col items-center justify-center px-5 sm:px-8 relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-warm-300/[0.06] rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-warm-200/[0.08] rounded-full blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />

      {/* Subtle decorative line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-warm-300/30" />

      <div className="relative z-10 text-center max-w-4xl stagger-children">
        <p className="font-body text-warm-700 text-sm uppercase tracking-[0.3em] mb-10 font-medium">
          Say It In India
        </p>

        <div className="relative min-h-[160px] md:min-h-[200px] flex items-center justify-center mb-8">
          <h1
            className="font-display text-[2.75rem] md:text-[4rem] lg:text-[4.75rem] text-warm-900 font-light leading-[1.1] tracking-tight transition-all duration-600"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {phrase.question}
          </h1>
        </div>

        {/* Rotating native script preview */}
        <div
          className="mb-12 h-10 flex items-center justify-center gap-3 sm:gap-4"
          style={{
            opacity: visible ? 0.6 : 0,
            transition: 'opacity 0.4s ease',
          }}
        >
          <span className="text-warm-700 text-sm tracking-wider uppercase font-semibold">{phrase.scriptLang}</span>
          <span className="w-6 h-px bg-warm-500" />
          <span className="font-display text-warm-700 text-2xl italic">{phrase.script}</span>
        </div>

        <p className="text-warm-600 text-base md:text-lg mb-14 max-w-xl mx-auto leading-relaxed font-light">
          One story. Thirty voices. Eleven languages. Hear the emotion change with every word.
        </p>

        <button
          onClick={onExplore}
          className="group relative px-8 sm:px-10 py-4 rounded-full font-body text-sm tracking-wide overflow-hidden transition-all duration-500"
        >
          <span className="absolute inset-0 bg-accent rounded-full transition-transform duration-500 group-hover:scale-105" />
          <span className="relative text-white font-medium">Start exploring</span>
        </button>

        <div className="mt-14 sm:mt-20 flex items-center justify-center gap-8">
          <span className="w-12 h-px bg-warm-300/40" />
          <p className="text-warm-700 text-sm tracking-wider font-semibold">
            scroll to explore
          </p>
          <span className="w-12 h-px bg-warm-300/40" />
        </div>
      </div>
    </section>
  )
}
