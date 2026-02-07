import { useState, useRef, useCallback } from 'react'
import type { Scene } from '../data/scenes'
import { languages, voices } from '../data/languages'
import { synthesizeWithCache, translateWithCache, playBase64Audio } from '../services/tts'

interface VoiceStageProps {
  scene: Scene
  onBack: () => void
}

export function VoiceStage({ scene, onBack }: VoiceStageProps) {
  const [selectedLang, setSelectedLang] = useState(scene.texts[0].languageCode)
  const [selectedVoice, setSelectedVoice] = useState<string>(voices[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [customText, setCustomText] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [translatedText, setTranslatedText] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentText = scene.texts.find(t => t.languageCode === selectedLang)
  const langInfo = languages.find(l => l.code === selectedLang)

  const handlePlay = useCallback(async () => {
    if (isLoading) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const rawText = useCustom && customText.trim() ? customText.trim() : currentText?.text
    if (!rawText) return

    setIsLoading(true)
    setIsPlaying(false)
    setTranslatedText('')

    try {
      // Translate custom text to the selected language before TTS
      let text = rawText
      if (useCustom && customText.trim() && selectedLang !== 'en-IN') {
        text = await translateWithCache(rawText, selectedLang)
        setTranslatedText(text)
      }

      const base64 = await synthesizeWithCache({
        text,
        languageCode: selectedLang,
        speaker: selectedVoice,
        pace: scene.pace,
        temperature: scene.temperature,
      })

      const audio = await playBase64Audio(base64)
      audioRef.current = audio
      audio.onended = () => setIsPlaying(false)
      audio.play()
      setIsPlaying(true)
    } catch (err) {
      console.error('TTS error:', err)
      alert('Failed to generate speech. Check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }, [selectedLang, selectedVoice, scene, currentText, customText, useCustom, isLoading])

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsPlaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-xl border-b border-warm-200">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center gap-5">
          <button
            onClick={onBack}
            className="text-warm-700 hover:text-warm-900 transition-colors duration-300 text-sm font-body font-semibold tracking-wide flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="w-px h-6 bg-warm-200" />
          <span className="text-2xl">{scene.emoji}</span>
          <div>
            <h1 className="font-display text-xl text-warm-900 font-normal">{scene.title}</h1>
            <p className="text-warm-700 text-sm tracking-wide">{scene.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* Left: Language + Voice selection */}
          <div className="space-y-10 animate-stage-left">
            {/* Language picker — horizontal scroll on mobile, vertical list on desktop */}
            <div>
              <p className="text-warm-800 text-sm uppercase tracking-[0.2em] mb-5 font-body font-medium">Language</p>

              {/* Mobile: horizontal scroll strip */}
              <div className="flex lg:hidden overflow-x-auto gap-2 pb-2 -mx-1 px-1 scrollbar-hide">
                {languages.map((lang) => {
                  const hasText = scene.texts.some(t => t.languageCode === lang.code)
                  return (
                    <button
                      key={lang.code}
                      onClick={() => hasText && setSelectedLang(lang.code)}
                      disabled={!hasText}
                      className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm transition-all duration-300 flex items-center gap-2 ${
                        selectedLang === lang.code
                          ? 'bg-accent-bg text-accent ring-1 ring-accent/30 font-medium'
                          : hasText
                          ? 'bg-warm-100 text-warm-700 hover:bg-warm-200'
                          : 'bg-warm-50 text-warm-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="font-body">{lang.name}</span>
                      <span className={`font-display text-xs italic ${
                        selectedLang === lang.code ? 'text-accent' : 'opacity-40'
                      }`}>{lang.nativeScript}</span>
                    </button>
                  )
                })}
              </div>

              {/* Desktop: vertical list */}
              <div className="hidden lg:block space-y-0.5">
                {languages.map((lang) => {
                  const hasText = scene.texts.some(t => t.languageCode === lang.code)
                  return (
                    <button
                      key={lang.code}
                      onClick={() => hasText && setSelectedLang(lang.code)}
                      disabled={!hasText}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-base flex items-center justify-between ${
                        selectedLang === lang.code
                          ? 'bg-accent-bg text-accent border border-accent/30 font-medium'
                          : hasText
                          ? 'text-warm-700 hover:bg-warm-100 hover:text-warm-800 border border-transparent'
                          : 'text-warm-400 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <span className={`font-body ${selectedLang === lang.code ? 'font-semibold' : ''}`}>{lang.name}</span>
                      <span className={`font-display text-xs italic ${
                        selectedLang === lang.code ? 'text-accent' : 'opacity-40'
                      }`}>{lang.nativeScript}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Voice picker */}
            <div>
              <p className="text-warm-800 text-sm uppercase tracking-[0.2em] mb-5 font-body font-medium">Voice</p>
              <div className="flex flex-wrap gap-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`px-4 py-2.5 rounded-full text-sm font-body tracking-wide transition-all duration-300 ${
                      selectedVoice === voice.id
                        ? 'bg-accent/10 text-accent ring-1 ring-accent/30 font-medium'
                        : 'bg-warm-100 text-warm-800 hover:bg-warm-200 hover:text-warm-900'
                    }`}
                  >
                    {voice.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Text display + Play */}
          <div className="space-y-8 animate-stage-right">
            {/* Text display */}
            <div className="relative rounded-2xl bg-white border border-warm-300/80 shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
              {/* Ambient glow */}
              {langInfo && (
                <div className={`absolute top-0 right-0 w-48 h-48 ${langInfo.color} opacity-[0.06] blur-[80px] rounded-full`} />
              )}

              <div className="relative p-6 sm:p-10 min-h-[240px]">
                {!useCustom ? (
                  <div className="animate-fade-in" key={selectedLang}>
                    <p className="font-display text-[1.75rem] md:text-[2.25rem] text-warm-900 leading-[1.4] mb-8 font-light">
                      {currentText?.text}
                    </p>
                    {currentText?.transliteration && (
                      <p className="text-warm-600 text-base italic mb-3 font-display">{currentText.transliteration}</p>
                    )}
                    {currentText?.englishMeaning && selectedLang !== 'en-IN' && (
                      <p className="text-warm-700 text-base leading-relaxed">{currentText.englishMeaning}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <textarea
                      value={customText}
                      onChange={(e) => { setCustomText(e.target.value); setTranslatedText('') }}
                      placeholder={`Type anything in English — we'll translate and speak it in ${langInfo?.name || 'the selected language'}...`}
                      className="w-full h-32 bg-transparent text-warm-900 text-xl font-display placeholder-warm-600 resize-none focus:outline-none"
                      maxLength={1000}
                    />
                    {translatedText && (
                      <div className="mt-4 pt-4 border-t border-warm-200">
                        <p className="text-warm-500 text-xs uppercase tracking-wider mb-2 font-body font-medium">Translated to {langInfo?.name}</p>
                        <p className="text-warm-800 text-lg font-display font-light">{translatedText}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Toggle custom text */}
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-sm text-warm-800 hover:text-accent transition-colors duration-300 tracking-wider uppercase font-body font-semibold"
            >
              {useCustom ? '← Back to preset text' : 'Type your own words →'}
            </button>

            {/* Play controls */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading}
                className={`group relative w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 rounded-full text-sm font-body font-medium tracking-wide transition-all duration-500 overflow-hidden ${
                  isLoading
                    ? 'bg-warm-200 text-warm-400 cursor-wait'
                    : isPlaying
                    ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200'
                    : 'shadow-[0_0_30px_rgba(194,101,42,0.1)]'
                }`}
              >
                {!isLoading && !isPlaying && (
                  <span className="absolute inset-0 bg-accent rounded-full transition-transform duration-500 group-hover:scale-105" />
                )}
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-warm-400 border-t-transparent rounded-full animate-spin" />
                      {useCustom && selectedLang !== 'en-IN' && !translatedText ? 'Translating...' : 'Generating...'}
                    </>
                  ) : isPlaying ? (
                    <>
                      <span className="w-4 h-4 bg-red-500 rounded-sm" />
                      Stop
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="text-white">{useCustom && selectedLang !== 'en-IN' ? `Translate & Play in ${langInfo?.name}` : `Play in ${langInfo?.name}`}</span>
                    </>
                  )}
                </span>
              </button>

              {/* Audio wave visualization */}
              {isPlaying && (
                <div className="flex items-center gap-[3px] h-6">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className="w-[3px] bg-accent/60 rounded-full origin-bottom"
                      style={{
                        height: '100%',
                        animation: `audioWave 1.2s ease-in-out ${i * 0.12}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Hint */}
            <div className="pt-6">
              <div className="h-px bg-gradient-to-r from-warm-200 to-transparent mb-6" />
              <p className="text-warm-700 text-sm leading-relaxed max-w-md">
                Try the same scene in a different language — the emotion stays, the texture changes entirely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
