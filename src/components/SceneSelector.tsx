import type { Scene } from '../data/scenes'

interface SceneSelectorProps {
  scenes: Scene[]
  onSelect: (scene: Scene) => void
}

export function SceneSelector({ scenes, onSelect }: SceneSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {scenes.map((scene) => (
        <button
          key={scene.id}
          onClick={() => onSelect(scene)}
          className="group text-left p-6 rounded-2xl bg-surface-raised border border-white/5 hover:border-white/15 transition-all duration-300 hover:bg-surface-overlay"
        >
          <span className="text-3xl mb-4 block">{scene.emoji}</span>
          <h3 className="font-display text-xl text-white mb-1 group-hover:text-amber-200 transition-colors">
            {scene.title}
          </h3>
          <p className="text-zinc-500 text-sm">{scene.subtitle}</p>
        </button>
      ))}
    </div>
  )
}
