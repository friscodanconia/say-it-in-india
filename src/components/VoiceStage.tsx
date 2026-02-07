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

    // Stop current audio
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
      <div className="sticky top-0 z-20 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors text-sm">
            &larr; Back
          </button>
          <span className="text-2xl">{scene.emoji}</span>
          <div>
            <h1 className="font-display text-xl text-white">{scene.title}</h1>
            <p className="text-zinc-500 text-sm">{scene.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left: Language + Voice selection */}
          <div className="space-y-8">
            {/* Language picker */}
            <div>
              <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-3">Language</h3>
              <div className="space-y-1">
                {languages.map((lang) => {
                  const hasText = scene.texts.some(t => t.languageCode === lang.code)
                  return (
                    <button
                      key={lang.code}
                      onClick={() => hasText && setSelectedLang(lang.code)}
                      disabled={!hasText}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all text-sm flex items-center justify-between ${
                        selectedLang === lang.code
                          ? 'bg-white/10 text-white'
                          : hasText
                          ? 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                          : 'text-zinc-700 cursor-not-allowed'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-xs opacity-60">{lang.nativeScript}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Voice picker */}
            <div>
              <h3 className="text-zinc-400 text-sm uppercase tracking-wider mb-3">Voice</h3>
              <div className="flex flex-wrap gap-2">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      selectedVoice === voice.id
                        ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                        : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                    }`}
                  >
                    {voice.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center + Right: Text display + Play */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text display */}
            <div className="bg-surface-raised rounded-2xl p-8 border border-white/5 min-h-[200px]">
              {!useCustom ? (
                <>
                  <p className="font-display text-2xl md:text-3xl text-white leading-relaxed mb-6">
                    {currentText?.text}
                  </p>
                  {currentText?.transliteration && (
                    <p className="text-zinc-500 text-sm italic mb-2">{currentText.transliteration}</p>
                  )}
                  {currentText?.englishMeaning && selectedLang !== 'en-IN' && (
                    <p className="text-zinc-600 text-sm">{currentText.englishMeaning}</p>
                  )}
                </>
              ) : (
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder={`Type your own text to hear it as "${scene.title}"...`}
                  className="w-full h-40 bg-transparent text-white text-xl font-display placeholder-zinc-600 resize-none focus:outline-none"
                  maxLength={2500}
                />
              )}
            </div>

            {/* Toggle custom text */}
            <button
              onClick={() => setUseCustom(!useCustom)}
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {useCustom ? '← Back to preset text' : 'Type your own words →'}
            </button>

            {/* Play controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={isPlaying ? handleStop : handlePlay}
                disabled={isLoading}
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-lg font-medium transition-all ${
                  isLoading
                    ? 'bg-white/5 text-zinc-500 cursor-wait'
                    : isPlaying
                    ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30 ring-1 ring-red-500/30'
                    : 'bg-white text-surface hover:bg-zinc-100'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : isPlaying ? (
                  <>
                    <span className="w-5 h-5 bg-red-400 rounded-sm" />
                    Stop
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play in {langInfo?.name}
                  </>
                )}
              </button>

              {isPlaying && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-amber-400 rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Postcard + hint */}
            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <p className="text-zinc-600 text-sm">
                Try the same scene in a different language — the emotion stays, the texture changes.
              </p>
              {!useCustom && currentText && langInfo && (
                <button
                  onClick={() => setShowPostcard(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all shrink-0 ml-4"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Postcard
                </button>
              )}
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
