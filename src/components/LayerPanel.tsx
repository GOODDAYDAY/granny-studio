import { RefreshCw, Shuffle } from 'lucide-react'
import { getLayerColor } from '../domain/design'
import { LAYERS } from '../domain/patterns'
import { useStudio } from '../store/studio'

export default function LayerPanel() {
  const design = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const activeLayer = useStudio((state) => state.activeLayer)
  const selectLayer = useStudio((state) => state.selectLayer)
  const fillLayer = useStudio((state) => state.fillLayer)
  const rotateColors = useStudio((state) => state.rotateColors)
  const shuffleColors = useStudio((state) => state.shuffleColors)

  if (!design) return null

  return (
    <section className="panel-section layer-panel">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">ROUNDS</span>
          <h2>四圈四色</h2>
        </div>
        <span className="section-count">4 色</span>
      </div>

      <p className="micro-hint layer-intro">
        一圈一个颜色。选好调色盘，点这一圈的「填」。
      </p>

      <div className="layer-list">
        {LAYERS.map((layer) => (
          <div
            key={layer.id}
            className={`layer-row${activeLayer === layer.id ? ' is-active' : ''}`}
            role="button"
            tabIndex={0}
            aria-pressed={activeLayer === layer.id}
            onClick={() => selectLayer(layer.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                selectLayer(layer.id)
              }
            }}
          >
            <span
              className="layer-swatch"
              style={{ background: getLayerColor(design, layer.id) }}
            />
            <span className="layer-info">
              <span className="layer-name">
                {layer.name}
                <em>{layer.count}</em>
              </span>
              <span className="layer-hint">{layer.hint}</span>
            </span>
            <button
              type="button"
              className="layer-fill"
              title={`用当前颜色填满${layer.name}`}
              onClick={(event) => {
                event.stopPropagation()
                fillLayer(layer.id)
              }}
            >
              填
            </button>
          </div>
        ))}
      </div>

      <div className="layer-actions">
        <button
          type="button"
          className="btn btn-soft"
          onClick={rotateColors}
          title="四个颜色在四圈之间轮换"
        >
          <RefreshCw size={14} />
          四色轮换
        </button>
        <button
          type="button"
          className="icon-btn bordered"
          onClick={shuffleColors}
          title="随机打乱四圈颜色"
          aria-label="随机打乱四圈颜色"
        >
          <Shuffle size={15} />
        </button>
      </div>
      <p className="micro-hint">只在四圈之间换色，不会再出现单瓣自定义。</p>
    </section>
  )
}
