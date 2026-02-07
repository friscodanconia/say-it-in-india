const API_URL = 'https://api.sarvam.ai/text-to-speech'
const API_KEY = import.meta.env.VITE_SARVAM_API_KEY

export interface TTSOptions {
  text: string
  languageCode: string
  speaker?: string
  pace?: number
  temperature?: number
}

export async function synthesizeSpeech(options: TTSOptions): Promise<string> {
  const { text, languageCode, speaker = 'anushka', pace = 1.0, temperature = 0.6 } = options

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-subscription-key': API_KEY,
    },
    body: JSON.stringify({
      text,
      target_language_code: languageCode,
      model: 'bulbul:v2',
      speaker,
      pace,
      temperature,
      speech_sample_rate: 24000,
      output_audio_codec: 'mp3',
      enable_preprocessing: true,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`TTS API error (${response.status}): ${err}`)
  }

  const data = await response.json()
  return data.audios[0] // base64-encoded audio
}

export function playBase64Audio(base64: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/mp3;base64,${base64}`)
    audio.oncanplaythrough = () => resolve(audio)
    audio.onerror = () => reject(new Error('Failed to load audio'))
    audio.load()
  })
}

// Cache for audio to avoid re-fetching
const audioCache = new Map<string, string>()

export function getCacheKey(options: TTSOptions): string {
  return `${options.languageCode}:${options.speaker}:${options.pace}:${options.text.slice(0, 50)}`
}

export async function synthesizeWithCache(options: TTSOptions): Promise<string> {
  const key = getCacheKey(options)
  if (audioCache.has(key)) {
    return audioCache.get(key)!
  }
  const audio = await synthesizeSpeech(options)
  audioCache.set(key, audio)
  return audio
}
