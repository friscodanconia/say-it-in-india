import type { Scene } from '../data/scenes'

interface SceneSelectorProps {
  scenes: Scene[]
  onSelect: (scene: Scene) => void
}

const sceneGradients: Record<string, string> = {
  'bedtime-story': 'from-indigo-950/40 via-surface-raised to-surface-raised',
  'street-food': 'from-orange-950/30 via-surface-raised to-surface-raised',
  'love-letter': 'from-rose-950/30 via-surface-raised to-surface-raised',
  'cricket-commentary': 'from-emerald-950/30 via-surface-raised to-surface-raised',
  'train-announcement': 'from-slate-800/30 via-surface-raised to-surface-raised',
  'grandmothers-recipe': 'from-amber-950/30 via-surface-raised to-surface-raised',
}

export function SceneSelector({ scenes, onSelect }: SceneSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onSelect(scene)}
          className={`group text-left relative overflow-hidden rounded-2xl bg-gradient-to-br ${sceneGradients[scene.id] || 'from-surface-overlay to-surface-raised'} border border-warm-900/20 hover:border-warm-700/30 transition-all duration-500 hover-lift`}
        >
          {/* Hover glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-warm-500/0 to-warm-500/0 group-hover:from-warm-500/[0.03] group-hover:to-transparent transition-all duration-700" />

          <div className="relative p-8 pb-10">
            <span className="text-4xl mb-6 block transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3 inline-block origin-center">
              {scene.emoji}
            </span>
            <h3 className="font-display text-2xl text-warm-100 mb-2 group-hover:text-warm-50 transition-colors duration-300 font-normal">
              {scene.title}
            </h3>
            <p className="text-stone-500 text-sm leading-relaxed">{scene.subtitle}</p>

            {/* Arrow indicator */}
            <div className="mt-6 flex items-center gap-2 text-warm-600 text-xs tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-8px] group-hover:translate-x-0">
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
