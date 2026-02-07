import { useState, useRef, useCallback } from 'react'
import { languages } from '../data/languages'
import { relayPhrases } from '../data/scenes'
import { synthesizeWithCache, playBase64Audio } from '../services/tts'

export function LanguageRelay() {
  const [selectedPhrase, setSelectedPhrase] = useState(relayPhrases[0])
  const [customPhrase, setCustomPhrase] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentLangIndex, setCurrentLangIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
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

    for (let i = 0; i < languages.length; i++) {
      if (stopRef.current) break

      const lang = languages[i]
      setCurrentLangIndex(i)

      const text = useCustom && customPhrase.trim()
        ? customPhrase.trim()
        : selectedPhrase.texts[lang.code]

      if (!text) continue

      try {
        if (i === 0) setIsLoading(true)
        const base64 = await synthesizeWithCache({
          text,
          languageCode: lang.code,
          speaker: 'anushka',
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
  }, [isPlaying, selectedPhrase, customPhrase, useCustom])

  return (
    <div className="space-y-10">
      {/* Phrase selector */}
      <div className="flex flex-wrap gap-3">
        {relayPhrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => { setSelectedPhrase(phrase); setUseCustom(false) }}
            className={`px-5 py-2.5 rounded-full text-xs font-body tracking-wide transition-all duration-300 ${
              !useCustom && selectedPhrase.id === phrase.id
                ? 'bg-warm-500/15 text-warm-300 ring-1 ring-warm-500/30'
                : 'bg-warm-900/10 text-stone-500 hover:bg-warm-900/20 hover:text-stone-300'
            }`}
          >
            {phrase.label}
          </button>
        ))}
        <button
          onClick={() => setUseCustom(true)}
          className={`px-5 py-2.5 rounded-full text-xs font-body tracking-wide transition-all duration-300 ${
            useCustom
              ? 'bg-warm-500/15 text-warm-300 ring-1 ring-warm-500/30'
              : 'bg-warm-900/10 text-stone-500 hover:bg-warm-900/20 hover:text-stone-300'
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
          placeholder="Type any phrase (in English or any supported language)..."
          className="w-full bg-surface-raised border border-warm-900/20 rounded-xl px-6 py-4 text-warm-50 placeholder-stone-700 focus:outline-none focus:border-warm-500/30 text-base font-display font-light transition-colors duration-300"
          maxLength={200}
        />
      )}

      {/* The relay visualization */}
      <div className="relative rounded-2xl bg-gradient-to-br from-surface-raised to-surface-overlay border border-warm-900/15 min-h-[320px] flex flex-col items-center justify-center overflow-hidden">
        {/* Language-colored ambient glow */}
        {currentLangIndex >= 0 && (
          <div
            className={`absolute inset-0 ${languages[currentLangIndex].color} opacity-[0.06] transition-all duration-700`}
          />
        )}

        {/* Decorative corner orbs */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-warm-600/[0.03] rounded-full blur-[60px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-warm-400/[0.03] rounded-full blur-[60px]" />

        {/* Content */}
        {currentLangIndex >= 0 ? (
          <div className="text-center animate-relay-in px-8" key={currentLangIndex}>
            <p className="text-warm-500/70 text-xs mb-3 uppercase tracking-[0.2em] font-body">
              {languages[currentLangIndex].name}
            </p>
            <p className="font-display text-5xl md:text-7xl text-warm-50 mb-6 font-light tracking-tight">
              {languages[currentLangIndex].nativeScript}
            </p>
            <p className="text-stone-400 text-base font-light max-w-sm mx-auto leading-relaxed">
              {useCustom ? customPhrase : selectedPhrase.texts[languages[currentLangIndex].code]}
            </p>
          </div>
        ) : (
          <div className="text-center px-8">
            <p className="font-display text-2xl text-warm-800 mb-3 font-light italic">
              {useCustom ? (customPhrase || 'Type a phrase above') : `"${selectedPhrase.label}"`}
            </p>
            <p className="text-stone-700 text-xs tracking-wider uppercase font-body">
              Press play to hear it cascade across 11 languages
            </p>
          </div>
        )}
      </div>

      {/* Language progress */}
      <div className="flex items-center justify-center gap-4">
        {languages.map((lang, i) => (
          <div key={lang.code} className="flex flex-col items-center gap-2">
            <div
              className={`rounded-full transition-all duration-500 ${
                i === currentLangIndex
                  ? `w-3.5 h-3.5 ${lang.color} scale-110`
                  : i < currentLangIndex
                  ? 'w-2.5 h-2.5 bg-warm-500/50'
                  : 'w-2.5 h-2.5 bg-warm-800/40'
              }`}
              style={i === currentLangIndex ? {
                boxShadow: `0 0 16px 4px rgba(201, 165, 90, 0.35)`,
              } : undefined}
            />
            <span className={`text-[9px] tracking-wider uppercase font-body transition-all duration-300 ${
              i === currentLangIndex
                ? 'text-warm-300 opacity-100'
                : i < currentLangIndex
                ? 'text-warm-600/40 opacity-100'
                : 'text-warm-800/30 opacity-100'
            }`}>
              {lang.name.slice(0, 3)}
            </span>
          </div>
        ))}
      </div>

      {/* Play button */}
      <div className="text-center">
        <button
          onClick={handlePlayAll}
          disabled={isLoading && !isPlaying}
          className={`group relative inline-flex items-center gap-3 px-10 py-4 rounded-full text-sm font-body font-medium tracking-wide transition-all duration-500 overflow-hidden ${
            isPlaying
              ? 'bg-red-500/10 text-red-300 hover:bg-red-500/15 ring-1 ring-red-500/20'
              : isLoading
              ? 'bg-warm-900/10 text-stone-600 cursor-wait'
              : ''
          }`}
        >
          {!isLoading && !isPlaying && (
            <span className="absolute inset-0 bg-warm-50 rounded-full transition-transform duration-500 group-hover:scale-105" />
          )}
          <span className="relative flex items-center gap-3">
            {isPlaying ? (
              <>
                <span className="w-4 h-4 bg-red-400/80 rounded-sm" />
                Stop Relay
              </>
            ) : isLoading ? (
              <>
                <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-surface" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span className="text-surface">Play All 11 Languages</span>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  )
}
