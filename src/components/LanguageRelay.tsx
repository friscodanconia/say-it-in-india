import { useState, useRef, useCallback } from 'react'
import { languages } from '../data/languages'
import { relayPhrases } from '../data/scenes'
import { synthesizeWithCache, translateWithCache, playBase64Audio } from '../services/tts'

export function LanguageRelay() {
  const [selectedPhrase, setSelectedPhrase] = useState(relayPhrases[0])
  const [customPhrase, setCustomPhrase] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLangIndex, setCurrentLangIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [currentTranslatedText, setCurrentTranslatedText] = useState('')
  const stopRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const handlePlayAll = useCallback(async () => {
    if (isPlaying) {
      stopRef.current = true
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setIsPlaying(false)
      setCurrentLangIndex(-1)
      return
    }

    stopRef.current = false
    setIsPlaying(true)
    setIsLoading(true)
    setCurrentTranslatedText('')

    for (let i = 0; i < languages.length; i++) {
      if (stopRef.current) break

      const lang = languages[i]
      setCurrentLangIndex(i)

      let text: string
      if (useCustom && customPhrase.trim()) {
        // Translate the custom English phrase to the current language
        if (lang.code === 'en-IN') {
          text = customPhrase.trim()
        } else {
          try {
            text = await translateWithCache(customPhrase.trim(), lang.code)
          } catch {
            text = customPhrase.trim()
          }
        }
        setCurrentTranslatedText(text)
      } else {
        text = (selectedPhrase.texts as Record<string, string>)[lang.code]
        setCurrentTranslatedText('')
      }

      if (!text) continue

      try {
        if (i === 0) setIsLoading(true)
        const base64 = await synthesizeWithCache({
          text,
          languageCode: lang.code,
          speaker: 'shubh',
          pace: 1.0,
          temperature: 0.6,
        })
        setIsLoading(false)

        if (stopRef.current) break

        const audio = await playBase64Audio(base64)
        audioRef.current = audio

        await new Promise<void>((resolve) => {
          audio.onended = () => resolve()
          audio.onerror = () => resolve()
          audio.play()
        })

        if (!stopRef.current && i < languages.length - 1) {
          await new Promise(r => setTimeout(r, 400))
        }
      } catch (err) {
        console.error(`Error with ${lang.name}:`, err)
        setIsLoading(false)
      }
    }

    setIsPlaying(false)
    setCurrentLangIndex(-1)
    setIsLoading(false)
    setCurrentTranslatedText('')
  }, [isPlaying, selectedPhrase, customPhrase, useCustom])

  return (
    <div className="space-y-10">
      {/* Phrase selector */}
      <div className="flex flex-wrap gap-2 sm:gap-3">
        {relayPhrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => { setSelectedPhrase(phrase); setUseCustom(false) }}
            className={`px-5 py-2.5 rounded-full text-sm font-body tracking-wide transition-all duration-300 ${
              !useCustom && selectedPhrase.id === phrase.id
                ? 'bg-accent/10 text-accent ring-1 ring-accent/30 font-medium'
                : 'bg-warm-100 text-warm-800 hover:bg-warm-200 hover:text-warm-900'
            }`}
          >
            {phrase.label}
          </button>
        ))}
        <button
          onClick={() => setUseCustom(true)}
          className={`px-5 py-2.5 rounded-full text-sm font-body tracking-wide transition-all duration-300 ${
            useCustom
              ? 'bg-accent/10 text-accent ring-1 ring-accent/30 font-medium'
              : 'bg-warm-100 text-warm-800 hover:bg-warm-200 hover:text-warm-900'
          }`}
        >
          Your own phrase
        </button>
      </div>

      {/* Custom input */}
      {useCustom && (
        <input
          type="text"
          value={customPhrase}
          onChange={(e) => setCustomPhrase(e.target.value)}
          placeholder="Type anything in English — we'll translate it into all 11 languages..."
          className="w-full bg-white border border-warm-300 rounded-xl px-6 py-4 text-warm-900 placeholder-warm-600 focus:outline-none focus:border-accent/50 text-base font-display transition-colors duration-300 shadow-sm"
          maxLength={200}
        />
      )}

      {/* The relay visualization */}
      <div className="relative rounded-2xl bg-white border border-warm-300/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)] min-h-[240px] sm:min-h-[320px] flex flex-col items-center justify-center overflow-hidden">
        {/* Language-colored ambient glow */}
        {currentLangIndex >= 0 && (
          <div
            className={`absolute inset-0 ${languages[currentLangIndex].color} opacity-[0.06] transition-all duration-700`}
          />
        )}

        {/* Decorative corner orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-warm-200/[0.4] rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-warm-100/[0.4] rounded-full blur-[60px]" />

        {/* Content */}
        {currentLangIndex >= 0 ? (
          <div className="text-center animate-relay-in px-8" key={currentLangIndex}>
            <p className="text-warm-700 text-sm mb-3 uppercase tracking-[0.2em] font-body font-medium">
              {languages[currentLangIndex].name}
            </p>
            <p className="font-display text-5xl md:text-7xl text-warm-900 mb-6 font-light tracking-tight">
              {languages[currentLangIndex].nativeScript}
            </p>
            <p className="text-warm-700 text-lg font-light max-w-sm mx-auto leading-relaxed">
              {useCustom ? (currentTranslatedText || customPhrase) : (selectedPhrase.texts as Record<string, string>)[languages[currentLangIndex].code]}
            </p>
          </div>
        ) : (
          <div className="text-center px-8">
            <p className="font-display text-2xl text-warm-800 mb-3 italic">
              {useCustom ? (customPhrase || 'Type a phrase above') : `"${selectedPhrase.label}"`}
            </p>
            <p className="text-warm-700 text-sm tracking-wider uppercase font-body font-medium">
              Press play to hear one phrase travel across India
            </p>
          </div>
        )}
      </div>

      {/* Language progress */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex items-center justify-center gap-2 sm:gap-4 min-w-max px-2">
          {languages.map((lang, i) => (
            <div key={lang.code} className="flex-shrink-0 flex flex-col items-center gap-2">
              <div
                className={`rounded-full transition-all duration-500 ${
                  i === currentLangIndex
                    ? `w-3.5 h-3.5 bg-accent scale-110`
                    : i < currentLangIndex
                    ? 'w-2.5 h-2.5 bg-warm-500'
                    : 'w-2.5 h-2.5 bg-warm-400'
                }`}
                style={i === currentLangIndex ? {
                  boxShadow: `0 0 16px 4px rgba(194, 101, 42, 0.35)`,
                } : undefined}
              />
              <span className={`hidden sm:block text-xs tracking-wider uppercase font-body font-semibold transition-all duration-300 ${
                i === currentLangIndex
                  ? 'text-accent opacity-100'
                  : i < currentLangIndex
                  ? 'text-warm-700 opacity-100'
                  : 'text-warm-600 opacity-100'
              }`}>
                {lang.name.slice(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Play button */}
      <div className="text-center">
        <button
          onClick={handlePlayAll}
          disabled={isLoading && !isPlaying}
          className={`group relative w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-body font-medium tracking-wide transition-all duration-500 overflow-hidden ${
            isPlaying
              ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200'
              : isLoading
              ? 'bg-warm-200 text-warm-400 cursor-wait'
              : ''
          }`}
        >
          {!isLoading && !isPlaying && (
            <span className="absolute inset-0 bg-accent rounded-full transition-transform duration-500 group-hover:scale-105" />
          )}
          <span className="relative flex items-center gap-3">
            {isPlaying ? (
              <>
                <span className="w-4 h-4 bg-red-500 rounded-sm" />
                Stop Relay
              </>
            ) : isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-warm-400 border-t-transparent rounded-full animate-spin" />
                {useCustom ? 'Translating...' : 'Loading...'}
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-white">{useCustom ? 'Translate & Play All 11 Languages' : 'Play All 11 Languages'}</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
