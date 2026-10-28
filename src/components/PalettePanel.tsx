import { Check, Copy, ImagePlus, Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { describeColor, isDark, normalizeHex } from '../domain/color'
import { useStudio } from '../store/studio'

export default function PalettePanel() {
  const palette = useStudio((state) => state.project.palette)
  const activeColor = useStudio((state) => state.activeColor)
  const selectColor = useStudio((state) => state.selectColor)
  const addPaletteColor = useStudio((state) => state.addPaletteColor)
  const openImagePicker = useStudio((state) => state.openImagePicker)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState(false)

  const paletteColor = palette.find((color) => color.hex === activeColor)
  const activeName = paletteColor?.name ?? describeColor(activeColor)

  const copyHex = async () => {
    try {
      await navigator.clipboard.writeText(activeColor)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section className="panel-section palette-panel">
      <div className="section-head compact">
        <div>
          <span className="eyebrow">PALETTE</span>
          <h2>调色盘</h2>
        </div>
        <span className="section-count">{palette.length} 色</span>
      </div>

      <div className="current-color">
        <span className="current-chip" style={{ background: activeColor }} />
        <div className="current-meta">
          <strong>{activeName}</strong>
          <button type="button" className="hex-button" onClick={copyHex} title="复制色值">
            {activeColor}
            {copied ? <Check size={12} /> : <Copy size={11} />}
          </button>
        </div>
      </div>

      <div className="color-grid" role="group" aria-label="调色盘颜色">
        {palette.map((color) => {
          const active = color.hex === activeColor
          return (
            <button
              key={color.id}
              type="button"
              className={`swatch${active ? ' is-active' : ''}`}
              title={`${color.name} ${color.hex}`}
              aria-label={`${color.name} ${color.hex}`}
              aria-pressed={active}
              onClick={() => selectColor(color.hex)}
            >
              <span className="swatch-fill" style={{ background: color.hex }} />
              {active && (
                <Check size={13} className="swatch-check" style={{ color: isDark(color.hex) ? '#FFF8EC' : '#3A3027' }} />
              )}
            </button>
          )
        })}
        <button
          type="button"
          className="swatch add-swatch"
          title="添加自定义颜色"
          aria-label="添加自定义颜色"
          onClick={() => colorInputRef.current?.click()}
        >
          <Plus size={17} />
        </button>
      </div>

      <input
        ref={colorInputRef}
        type="color"
        className="sr-only"
        value={normalizeHex(activeColor) ?? '#B85C42'}
        onChange={(event) => addPaletteColor(event.target.value, 'custom')}
        aria-label="选择自定义颜色"
      />

      <button type="button" className="btn btn-soft picker-launch" onClick={openImagePicker}>
        <ImagePlus size={16} />
        从图片取色
      </button>
      <p className="micro-hint">上传一张参考图，在任意位置吸色；图片不会上传。</p>
    </section>
  )
}
