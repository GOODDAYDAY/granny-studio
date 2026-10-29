import { RefreshCw, Shuffle } from 'lucide-react'
import {
  getLayerColor,
  isLayerUniform,
} from '../domain/design'
import { LAYERS, regionsOfLayer } from '../domain/patterns'
import { useStudio } from '../store/studio'
import BackgroundPanel from './BackgroundPanel'

export default function LayerPanel() {
  const design = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const activeLayer = useStudio((state) => state.activeLayer)
  const selectLayer = useStudio((state) => state.selectLayer)
  const fillLayer = useStudio((state) => state.fillLayer)
  const setPuffPlacement = useStudio((state) => state.setPuffPlacement)
  const rotateColors = useStudio((state) => state.rotateColors)
  const shuffleColors = useStudio((state) => state.shuffleColors)

  if (!design) return null

  return (
    <section className="panel-section layer-panel">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">LAYERS</span>
          <h2>分层上色</h2>
        </div>
        <span className="section-count">点单瓣也行</span>
      </div>

      <div className="layer-list">
        {LAYERS.map((layer) => {
          const uniform = isLayerUniform(design, layer.id)
          const colors = Array.from(
            new Set(regionsOfLayer(layer.id).map((region) => design.colors[region.id])),
          )
          const swatchStyle = uniform
            ? { background: getLayerColor(design, layer.id) }
            : {
                background: `conic-gradient(${colors
                  .map(
                    (color, index) =>
                      `${color} ${(index * 360) / colors.length}deg ${((index + 1) * 360) / colors.length}deg`,
                  )
                  .join(', ')})`,
              }
          return (
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
              <span className="layer-swatch" style={swatchStyle} />
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
          )
        })}
      </div>

      <div className="placement-row">
        <span>外瓣层序</span>
        <div className="segmented small" role="group" aria-label="外瓣层序">
          <button
            type="button"
            className={design.puffPlacement === 'inner' ? 'is-active' : ''}
            onClick={() => setPuffPlacement('inner')}
          >
            里侧
          </button>
          <button
            type="button"
            className={design.puffPlacement === 'outer' ? 'is-active' : ''}
            onClick={() => setPuffPlacement('outer')}
          >
            外侧
          </button>
        </div>
      </div>
      <p className="micro-hint">照片里两种层序都有；切一下看效果。</p>

      <div className="layer-actions">
        <button
          type="button"
          className="btn btn-soft"
          onClick={rotateColors}
          title="四个颜色在花心、外瓣、底针、边框之间轮换"
        >
          <RefreshCw size={14} />
          四色轮换
        </button>
        <button
          type="button"
          className="icon-btn bordered"
          onClick={shuffleColors}
          title="随机打乱四层颜色"
          aria-label="随机打乱四层颜色"
        >
          <Shuffle size={15} />
        </button>
      </div>
      <p className="micro-hint">轮换会用层颜色重排，单瓣自定义会被覆盖。</p>

      <BackgroundPanel />
    </section>
  )
}
