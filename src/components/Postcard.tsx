import { useRef, useState } from 'react'
import { toPng } from 'html-to-image'
import type { Language } from '../data/languages'

interface PostcardProps {
  text: string
  transliteration?: string
  englishMeaning?: string
  language: Language
  sceneTitle: string
  sceneEmoji: string
  onClose: () => void
}

export function Postcard({
  text,
  transliteration,
  englishMeaning,
  language,
  sceneTitle,
  sceneEmoji,
  onClose,
}: PostcardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setIsDownloading(true)

    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        backgroundColor: '#0a0a0f',
      })

      const link = document.createElement('a')
      link.download = `say-it-in-${language.name.toLowerCase()}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to generate image:', err)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* The card itself */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-raised to-surface-overlay p-10 border border-white/10"
        >
          {/* Decorative gradient orb */}
          <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full ${language.color} opacity-15 blur-3xl`} />
          <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${language.color} opacity-10 blur-2xl`} />

          <div className="relative">
            {/* Scene tag */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-lg">{sceneEmoji}</span>
              <span className="text-zinc-500 text-sm uppercase tracking-wider">{sceneTitle}</span>
            </div>

            {/* Language */}
            <p className={`text-sm font-medium ${language.textColor} mb-3 uppercase tracking-wider`}>
              {language.name} &middot; {language.nativeScript}
            </p>

            {/* Main text */}
            <p className="font-display text-2xl md:text-3xl text-white leading-relaxed mb-6">
              {text}
            </p>

            {/* Transliteration */}
            {transliteration && (
              <p className="text-zinc-500 text-sm italic mb-2">{transliteration}</p>
            )}

            {/* English meaning */}
            {englishMeaning && (
              <p className="text-zinc-600 text-sm">{englishMeaning}</p>
            )}

            {/* Branding */}
            <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between">
              <span className="text-zinc-600 text-xs tracking-wider">SAY IT IN INDIA</span>
              <span className="text-zinc-700 text-xs">Powered by Sarvam AI</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-white text-surface font-medium hover:bg-zinc-100 transition-colors disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Postcard
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
