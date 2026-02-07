export interface Language {
  code: string
  name: string
  nativeScript: string
  color: string // tailwind bg class
  textColor: string
}

export const languages: Language[] = [
  { code: 'hi-IN', name: 'Hindi', nativeScript: 'हिन्दी', color: 'bg-orange-500', textColor: 'text-orange-700' },
  { code: 'bn-IN', name: 'Bengali', nativeScript: 'বাংলা', color: 'bg-indigo-500', textColor: 'text-indigo-700' },
  { code: 'ta-IN', name: 'Tamil', nativeScript: 'தமிழ்', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
  { code: 'te-IN', name: 'Telugu', nativeScript: 'తెలుగు', color: 'bg-amber-500', textColor: 'text-amber-700' },
  { code: 'gu-IN', name: 'Gujarati', nativeScript: 'ગુજરાતી', color: 'bg-pink-500', textColor: 'text-pink-700' },
  { code: 'kn-IN', name: 'Kannada', nativeScript: 'ಕನ್ನಡ', color: 'bg-red-500', textColor: 'text-red-700' },
  { code: 'ml-IN', name: 'Malayalam', nativeScript: 'മലയാളം', color: 'bg-cyan-500', textColor: 'text-cyan-700' },
  { code: 'mr-IN', name: 'Marathi', nativeScript: 'मराठी', color: 'bg-violet-500', textColor: 'text-violet-700' },
  { code: 'pa-IN', name: 'Punjabi', nativeScript: 'ਪੰਜਾਬੀ', color: 'bg-yellow-500', textColor: 'text-yellow-700' },
  { code: 'od-IN', name: 'Odia', nativeScript: 'ଓଡ଼ିଆ', color: 'bg-teal-500', textColor: 'text-teal-700' },
  { code: 'en-IN', name: 'English', nativeScript: 'English', color: 'bg-slate-500', textColor: 'text-slate-600' },
]

export interface Voice {
  id: string
  label: string
}

export const voices: Voice[] = [
  { id: 'shubh', label: 'Shubh' },
  { id: 'priya', label: 'Priya' },
  { id: 'kavya', label: 'Kavya' },
  { id: 'rahul', label: 'Rahul' },
  { id: 'shreya', label: 'Shreya' },
  { id: 'rohan', label: 'Rohan' },
  { id: 'neha', label: 'Neha' },
  { id: 'kabir', label: 'Kabir' },
  { id: 'ritu', label: 'Ritu' },
  { id: 'aditya', label: 'Aditya' },
]
