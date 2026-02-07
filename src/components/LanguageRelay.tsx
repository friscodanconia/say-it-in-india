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

        // Brief pause between languages
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
    <div className="space-y-8">
      {/* Phrase selector */}
      <div className="flex flex-wrap gap-3">
        {relayPhrases.map((phrase) => (
          <button
            key={phrase.id}
            onClick={() => { setSelectedPhrase(phrase); setUseCustom(false) }}
            className={`px-5 py-2.5 rounded-full text-sm transition-all ${
              !useCustom && selectedPhrase.id === phrase.id
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10'
            }`}
          >
            {phrase.label}
          </button>
        ))}
        <button
          onClick={() => setUseCustom(true)}
          className={`px-5 py-2.5 rounded-full text-sm transition-all ${
            useCustom
              ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
              : 'bg-white/5 text-zinc-400 hover:bg-white/10'
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
          className="w-full bg-surface-raised border border-white/10 rounded-xl px-5 py-4 text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 text-lg"
          maxLength={200}
        />
      )}

      {/* The relay visualization */}
      <div className="relative bg-surface-raised rounded-2xl p-8 border border-white/5 min-h-[300px] flex flex-col items-center justify-center overflow-hidden">
        {/* Background glow for current language */}
        {currentLangIndex >= 0 && (
          <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${languages[currentLangIndex].color}`} />
        )}

        {/* Current language display */}
        {currentLangIndex >= 0 ? (
          <div className="text-center animate-fade-in-up" key={currentLangIndex}>
            <p className="text-zinc-500 text-sm mb-2 uppercase tracking-wider">
              {languages[currentLangIndex].name}
            </p>
            <p className="font-display text-4xl md:text-6xl text-white mb-4">
              {languages[currentLangIndex].nativeScript}
            </p>
            <p className="text-zinc-400 text-lg">
              {useCustom ? customPhrase : selectedPhrase.texts[languages[currentLangIndex].code]}
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-display text-2xl text-zinc-600 mb-2">
              {useCustom ? (customPhrase || 'Type a phrase above') : `"${selectedPhrase.label}"`}
            </p>
            <p className="text-zinc-700 text-sm">Press play to hear it cascade across 11 languages</p>
          </div>
        )}
      </div>

      {/* Language progress dots */}
      <div className="flex items-center justify-center gap-2">
        {languages.map((lang, i) => (
          <div
            key={lang.code}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentLangIndex
                ? `${lang.color} scale-125 animate-pulse-ring`
                : i < currentLangIndex
                ? 'bg-white/30'
                : 'bg-white/10'
            }`}
            title={lang.name}
          />
        ))}
      </div>

      {/* Play button */}
      <div className="text-center">
        <button
          onClick={handlePlayAll}
          disabled={isLoading && !isPlaying}
          className={`inline-flex items-center gap-3 px-10 py-4 rounded-full text-lg font-medium transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 ring-1 ring-red-500/30'
              : isLoading
              ? 'bg-white/5 text-zinc-500 cursor-wait'
              : 'bg-white text-surface hover:bg-zinc-100'
          }`}
        >
          {isPlaying ? (
            <>
              <span className="w-5 h-5 bg-red-400 rounded-sm" />
              Stop Relay
            </>
          ) : isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play All 11 Languages
            </>
          )}
        </button>
      </div>
    </div>
  )
}
