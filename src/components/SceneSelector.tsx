import type { Scene } from '../data/scenes'

interface SceneSelectorProps {
  scenes: Scene[]
  onSelect: (scene: Scene) => void
}

const sceneGradients: Record<string, string> = {
  'bedtime-story': 'from-indigo-50/60 via-white to-white',
  'street-food': 'from-orange-50/60 via-white to-white',
  'love-letter': 'from-rose-50/60 via-white to-white',
  'cricket-commentary': 'from-emerald-50/60 via-white to-white',
  'train-announcement': 'from-slate-50/60 via-white to-white',
  'grandmothers-recipe': 'from-amber-50/60 via-white to-white',
}

export function SceneSelector({ scenes, onSelect }: SceneSelectorProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 stagger-children">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onSelect(scene)}
          className={`group text-left relative overflow-hidden rounded-2xl bg-gradient-to-br ${sceneGradients[scene.id] || 'from-surface-overlay to-surface-raised'} border border-warm-300/80 hover:border-accent/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-500 hover-lift`}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/[0.03] group-hover:to-transparent transition-all duration-700" />

          <div className="relative p-5 sm:p-8 pb-7 sm:pb-10">
            <span className="text-3xl sm:text-4xl mb-4 sm:mb-6 block transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 inline-block origin-center">
              {scene.emoji}
            </span>
            <h3 className="font-display text-lg sm:text-2xl text-warm-900 mb-2 group-hover:text-warm-800 transition-colors duration-300 font-normal">
              {scene.title}
            </h3>
            <p className="text-warm-800 text-sm sm:text-base leading-relaxed">{scene.subtitle}</p>

            {/* Arrow indicator — hidden on mobile (hover-only) */}
            <div className="mt-6 hidden sm:flex items-center gap-2 text-accent text-sm font-medium tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-8px] group-hover:translate-x-0">
              <span>Listen</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}
