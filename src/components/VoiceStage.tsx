import { useState, useRef, useCallback } from 'react'
import type { Scene } from '../data/scenes'
import { languages, voices } from '../data/languages'
import { synthesizeWithCache, playBase64Audio } from '../services/tts'
import { Postcard } from './Postcard'

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
  const [showPostcard, setShowPostcard] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const currentText = scene.texts.find(t => t.languageCode === selectedLang)
  const langInfo = languages.find(l => l.code === selectedLang)

  const handlePlay = useCallback(async () => {
    if (isLoading) return

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    const text = useCustom && customText.trim() ? customText.trim() : currentText?.text
    if (!text) return

    setIsLoading(true)
    setIsPlaying(false)

    try {
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
      <div className="sticky top-0 z-20 bg-surface/90 backdrop-blur-xl border-b border-warm-900/10">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center gap-5">
          <button
            onClick={onBack}
            className="text-stone-500 hover:text-warm-200 transition-colors duration-300 text-sm font-body tracking-wide flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="w-px h-6 bg-warm-900/20" />
          <span className="text-2xl">{scene.emoji}</span>
          <div>
            <h1 className="font-display text-xl text-warm-100 font-normal">{scene.title}</h1>
            <p className="text-stone-600 text-xs tracking-wide">{scene.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
          {/* Left: Language + Voice selection */}
          <div className="space-y-10 animate-stage-left">
            {/* Language picker */}
            <div>
              <p className="text-warm-500 text-xs uppercase tracking-[0.2em] mb-5 font-body">Language</p>
              <div className="space-y-0.5">
                {languages.map((lang) => {
                  const hasText = scene.texts.some(t => t.languageCode === lang.code)
                  return (
                    <button
                      key={lang.code}
                      onClick={() => hasText && setSelectedLang(lang.code)}
                      disabled={!hasText}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 text-sm flex items-center justify-between ${
                        selectedLang === lang.code
                          ? 'bg-warm-900/30 text-warm-100 border border-warm-700/20'
                          : hasText
                          ? 'text-stone-400 hover:bg-warm-900/10 hover:text-warm-200 border border-transparent'
                          : 'text-stone-700 cursor-not-allowed border border-transparent'
                      }`}
                    >
                      <span className="font-body">{lang.name}</span>
                      <span className={`font-display text-xs italic ${
                        selectedLang === lang.code ? 'text-warm-400' : 'opacity-40'
                      }`}>{lang.nativeScript}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Voice picker */}
            <div>
              <p className="text-warm-500 text-xs uppercase tracking-[0.2em] mb-5 font-body">Voice</p>
              <div className="flex flex-wrap gap-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`px-4 py-2 rounded-full text-xs font-body tracking-wide transition-all duration-300 ${
                      selectedVoice === voice.id
                        ? 'bg-warm-500/15 text-warm-300 ring-1 ring-warm-500/30'
                        : 'bg-warm-900/10 text-stone-500 hover:bg-warm-900/20 hover:text-stone-300'
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
            <div className="relative rounded-2xl bg-gradient-to-br from-surface-raised to-surface-overlay border border-warm-900/15 overflow-hidden">
              {/* Ambient glow */}
              {langInfo && (
                <div className={`absolute top-0 right-0 w-48 h-48 ${langInfo.color} opacity-[0.04] blur-[80px] rounded-full`} />
              )}

              <div className="relative p-10 min-h-[240px]">
                {!useCustom ? (
                  <div className="animate-fade-in" key={selectedLang}>
                    <p className="font-display text-[1.75rem] md:text-[2.25rem] text-warm-50 leading-[1.4] mb-8 font-light">
                      {currentText?.text}
                    </p>
                    {currentText?.transliteration && (
                      <p className="text-warm-600/60 text-sm italic mb-3 font-display">{currentText.transliteration}</p>
                    )}
                    {currentText?.englishMeaning && selectedLang !== 'en-IN' && (
                      <p className="text-stone-600 text-sm leading-relaxed">{currentText.englishMeaning}</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={`Type your own text to hear it as "${scene.title}"...`}
                    className="w-full h-40 bg-transparent text-warm-50 text-xl font-display font-light placeholder-stone-700 resize-none focus:outline-none"
                    maxLength={2500}
                  />
                )}
              </div>
            </div>

            {/* Toggle custom text */}
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-xs text-stone-500 hover:text-warm-400 transition-colors duration-300 tracking-wider uppercase font-body"
            >
              {useCustom ? '← Back to preset text' : 'Type your own words →'}
            </button>

            {/* Play controls */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading}
                className={`group relative flex items-center gap-3 px-10 py-4 rounded-full text-sm font-body font-medium tracking-wide transition-all duration-500 overflow-hidden ${
                  isLoading
                    ? 'bg-warm-800/30 text-stone-500 cursor-wait'
                    : isPlaying
                    ? 'bg-red-500/10 text-red-300 hover:bg-red-500/15 ring-1 ring-red-500/20'
                    : 'shadow-[0_0_30px_rgba(201,165,90,0.12)]'
                }`}
              >
                {!isLoading && !isPlaying && (
                  <span className="absolute inset-0 bg-warm-50 rounded-full transition-transform duration-500 group-hover:scale-105" />
                )}
                <span className="relative flex items-center gap-3">
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-stone-600 border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : isPlaying ? (
                    <>
                      <span className="w-4 h-4 bg-red-400/80 rounded-sm" />
                      Stop
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-surface" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="text-surface">Play in {langInfo?.name}</span>
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
                      className="w-[3px] bg-warm-400/60 rounded-full origin-bottom"
                      style={{
                        height: '100%',
                        animation: `audioWave 1.2s ease-in-out ${i * 0.12}s infinite`,
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Postcard button */}
              {!useCustom && currentText && langInfo && (
                <button
                  onClick={() => setShowPostcard(true)}
                  className="ml-auto flex items-center gap-2.5 px-6 py-3 rounded-full text-xs text-stone-400 hover:text-warm-300 bg-warm-900/20 hover:bg-warm-900/30 ring-1 ring-warm-900/20 hover:ring-warm-700/30 transition-all duration-300 tracking-wider uppercase font-body"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Postcard
                </button>
              )}
            </div>

            {/* Hint */}
            <div className="pt-6">
              <div className="h-px bg-gradient-to-r from-warm-900/15 to-transparent mb-6" />
              <p className="text-stone-600 text-xs leading-relaxed font-light max-w-md">
                Try the same scene in a different language — the emotion stays, the texture changes entirely.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Postcard modal */}
      {showPostcard && currentText && langInfo && (
        <Postcard
          text={currentText.text}
          transliteration={currentText.transliteration}
          englishMeaning={currentText.englishMeaning}
          language={langInfo}
          sceneTitle={scene.title}
          sceneEmoji={scene.emoji}
          onClose={() => setShowPostcard(false)}
        />
      )}
    </div>
  )
}
