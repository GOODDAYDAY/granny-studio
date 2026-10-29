import { DEFAULT_GAP_COLORS, GAP_LAYERS } from '../domain/patterns'
import { useStudio } from '../store/studio'

export default function GapLayerPanel() {
  const design = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const setGapColor = useStudio((state) => state.setGapColor)

  if (!design) return null

  const gaps = { ...DEFAULT_GAP_COLORS, ...(design.gaps ?? {}) }

  return (
    <div className="gap-panel">
      <div className="sub-label">
        <span>间隙层</span>
        <span>一层一层</span>
      </div>
      {GAP_LAYERS.map((layer) => (
        <div className="gap-row" key={layer.id}>
          <span
            className="gap-swatch"
            style={{ background: gaps[layer.id] }}
            aria-hidden="true"
          />
          <span className="gap-info">
            <span className="gap-name">{layer.name}</span>
            <span className="gap-hint">{layer.hint}</span>
          </span>
          <button
            type="button"
            className="layer-fill"
            title={`用当前颜色填${layer.name}间隙`}
            aria-label={`用当前颜色填${layer.name}间隙`}
            onClick={() => setGapColor(layer.id)}
          >
            填
          </button>
        </div>
      ))}
      <p className="micro-hint">
        也可以直接点画布上的空隙；这四层颜色属于这张方格。
      </p>
    </div>
  )
}
