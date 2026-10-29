import { DEFAULT_BACKGROUND } from '../domain/patterns'
import { useStudio } from '../store/studio'

export default function BackgroundPanel() {
  const design = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const setBackground = useStudio((state) => state.setBackground)

  if (!design) return null

  const color = design.background ?? DEFAULT_BACKGROUND

  return (
    <div className="bg-panel">
      <div className="sub-label">
        <span>方格背景</span>
        <span>外框以内</span>
      </div>
      <div className="bg-row">
        <span
          className="bg-swatch"
          style={{ background: color }}
          aria-hidden="true"
        />
        <span className="bg-info">
          <span className="bg-name">背景色</span>
          <span className="bg-hint">最外层方框里的白色区域</span>
        </span>
        <button
          type="button"
          className="layer-fill"
          title="用当前颜色填满方格背景"
          aria-label="用当前颜色填满方格背景"
          onClick={() => setBackground()}
        >
          填
        </button>
      </div>
      <p className="micro-hint">
        也可以直接点边框内的背景；这个颜色属于这张方格。
      </p>
    </div>
  )
}
