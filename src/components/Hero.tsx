interface HeroProps {
  onExplore: () => void
}

const hookPhrases = [
  { question: "How does 'I miss you' sound in Bengali?", lang: 'বাংলা' },
  { question: "How does 'Good morning' sound in Tamil?", lang: 'தமிழ்' },
  { question: "How does a bedtime story sound in Hindi?", lang: 'हिन्दी' },
  { question: "How does a love letter sound in Malayalam?", lang: 'മലയാളം' },
]

export function Hero({ onExplore }: HeroProps) {
  const phrase = hookPhrases[Math.floor(Math.random() * hookPhrases.length)]

  return (
    <section className="min-h-[85vh] flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface to-surface-raised" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 text-center max-w-3xl">
        <p className="text-zinc-500 uppercase tracking-widest text-sm mb-6">Say It In India</p>

        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-tight mb-6">
          {phrase.question}
        </h1>

        <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-xl mx-auto">
          Hear your words come alive in 11 Indian languages, 30+ voices, and countless emotions.
        </p>

        <button
          onClick={onExplore}
          className="bg-white text-surface font-medium px-8 py-4 rounded-full text-lg hover:bg-zinc-100 transition-colors"
        >
          Start exploring
        </button>

        <p className="mt-16 text-zinc-600 text-sm">
          Scroll to explore scenes, or jump straight to the 11-language relay
        </p>
      </div>
    </section>
  )
}
