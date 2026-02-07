export interface Language {
  code: string
  name: string
  nativeScript: string
  color: string // tailwind bg class
  textColor: string
}

export const languages: Language[] = [
  { code: 'hi-IN', name: 'Hindi', nativeScript: 'हिन्दी', color: 'bg-orange-500', textColor: 'text-orange-400' },
  { code: 'bn-IN', name: 'Bengali', nativeScript: 'বাংলা', color: 'bg-indigo-500', textColor: 'text-indigo-400' },
  { code: 'ta-IN', name: 'Tamil', nativeScript: 'தமிழ்', color: 'bg-emerald-500', textColor: 'text-emerald-400' },
  { code: 'te-IN', name: 'Telugu', nativeScript: 'తెలుగు', color: 'bg-amber-500', textColor: 'text-amber-400' },
  { code: 'gu-IN', name: 'Gujarati', nativeScript: 'ગુજરાતી', color: 'bg-pink-500', textColor: 'text-pink-400' },
  { code: 'kn-IN', name: 'Kannada', nativeScript: 'ಕನ್ನಡ', color: 'bg-red-500', textColor: 'text-red-400' },
  { code: 'ml-IN', name: 'Malayalam', nativeScript: 'മലയാളം', color: 'bg-cyan-500', textColor: 'text-cyan-400' },
  { code: 'mr-IN', name: 'Marathi', nativeScript: 'मराठी', color: 'bg-violet-500', textColor: 'text-violet-400' },
  { code: 'pa-IN', name: 'Punjabi', nativeScript: 'ਪੰਜਾਬੀ', color: 'bg-yellow-500', textColor: 'text-yellow-400' },
  { code: 'od-IN', name: 'Odia', nativeScript: 'ଓଡ଼ିଆ', color: 'bg-teal-500', textColor: 'text-teal-400' },
  { code: 'en-IN', name: 'English', nativeScript: 'English', color: 'bg-slate-500', textColor: 'text-slate-400' },
]

export interface Voice {
  id: string
  label: string
}

export const voices: Voice[] = [
  { id: 'anushka', label: 'Anushka' },
  { id: 'priya', label: 'Priya' },
  { id: 'kavya', label: 'Kavya' },
  { id: 'shreya', label: 'Shreya' },
  { id: 'vidya', label: 'Vidya' },
  { id: 'arya', label: 'Arya' },
  { id: 'aditya', label: 'Aditya' },
  { id: 'rahul', label: 'Rahul' },
  { id: 'rohan', label: 'Rohan' },
  { id: 'kabir', label: 'Kabir' },
]
