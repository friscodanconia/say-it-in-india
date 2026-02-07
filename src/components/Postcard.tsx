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
        backgroundColor: '#111110',
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="max-w-lg w-full space-y-8 animate-scale-in">
        {/* The card itself */}
        <div
          ref={cardRef}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-raised via-surface-overlay to-surface-raised p-12 border border-warm-800/20"
        >
          {/* Decorative gradient orbs */}
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full ${language.color} opacity-[0.08] blur-[80px]`} />
          <div className={`absolute -bottom-16 -left-16 w-48 h-48 rounded-full ${language.color} opacity-[0.05] blur-[60px]`} />

          <div className="relative">
            {/* Scene tag */}
            <div className="flex items-center gap-3 mb-10">
              <span className="text-lg">{sceneEmoji}</span>
              <span className="text-warm-600/60 text-xs uppercase tracking-[0.2em] font-body">{sceneTitle}</span>
            </div>

            {/* Language */}
            <p className={`text-xs font-body font-medium ${language.textColor} mb-4 uppercase tracking-[0.2em]`}>
              {language.name} &middot; {language.nativeScript}
            </p>

            {/* Main text */}
            <p className="font-display text-2xl md:text-3xl text-warm-50 leading-[1.5] mb-8 font-light">
              {text}
            </p>

            {/* Transliteration */}
            {transliteration && (
              <p className="text-warm-600/50 text-sm italic mb-3 font-display">{transliteration}</p>
            )}

            {/* English meaning */}
            {englishMeaning && (
              <p className="text-stone-600 text-sm leading-relaxed font-light">{englishMeaning}</p>
            )}

            {/* Branding */}
            <div className="mt-12 pt-6 border-t border-warm-800/15 flex items-center justify-between">
              <span className="font-display text-warm-700/40 text-sm italic">Say It In India</span>
              <span className="text-stone-700 text-[10px] tracking-wider font-body uppercase">Powered by Sarvam AI</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group relative flex items-center gap-2 px-8 py-3.5 rounded-full font-body text-sm tracking-wide overflow-hidden transition-all duration-500 disabled:opacity-50"
          >
            <span className="absolute inset-0 bg-warm-50 rounded-full transition-transform duration-500 group-hover:scale-105" />
            <span className="relative flex items-center gap-2 text-surface font-medium">
              {isDownloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Postcard
                </>
              )}
            </span>
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3.5 rounded-full text-stone-500 hover:text-warm-200 transition-colors duration-300 text-sm font-body tracking-wide"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
