import { Redo2, Undo2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { describeColor } from '../domain/color'
import { useStudio } from '../store/studio'
import FlowerSvg from '../render/FlowerSvg'

export default function SquareEditor() {
  const design = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const activeColor = useStudio((state) => state.activeColor)
  const palette = useStudio((state) => state.project.palette)
  const fillLayer = useStudio((state) => state.fillLayer)
  const renameDesign = useStudio((state) => state.renameDesign)
  const undo = useStudio((state) => state.undo)
  const redo = useStudio((state) => state.redo)
  const canUndo = useStudio((state) => state.past.length > 0)
  const canRedo = useStudio((state) => state.future.length > 0)

  const [title, setTitle] = useState(design?.name ?? '')

  useEffect(() => {
    setTitle(design?.name ?? '')
  }, [design?.id, design?.name])

  if (!design) {
    return (
      <div className="empty-stage">
        <p>还没有方格。</p>
      </div>
    )
  }

  const commitTitle = () => {
    const next = title.trim()
    if (!next) {
      setTitle(design.name)
      return
    }
    if (next !== design.name) renameDesign(design.id, next)
  }

  const activeColorName =
    palette.find((color) => color.hex === activeColor)?.name ??
    describeColor(activeColor)

  return (
    <>
      <div className="stage-top">
        <div className="stage-heading">
          <input
            className="design-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.blur()
              } else if (event.key === 'Escape') {
                setTitle(design.name)
                event.currentTarget.blur()
              }
            }}
            aria-label="方格名称"
            spellCheck={false}
          />
          <p className="stage-sub">
            四圈 · 4 个颜色 · 6 / 6 / 8 / 16
          </p>
        </div>
        <div className="stage-actions">
          <button
            type="button"
            className="icon-btn bordered"
            onClick={undo}
            disabled={!canUndo}
            title="撤销 Ctrl+Z"
            aria-label="撤销"
          >
            <Undo2 size={17} />
          </button>
          <button
            type="button"
            className="icon-btn bordered"
            onClick={redo}
            disabled={!canRedo}
            title="重做 Ctrl+Shift+Z"
            aria-label="重做"
          >
            <Redo2 size={17} />
          </button>
        </div>
      </div>

      <div className="flower-stage">
        <div className="flower-wrap">
          <FlowerSvg
            design={design}
            prefix="editor"
            interactive
            onFillLayer={fillLayer}
          />
        </div>
        <div className="stage-hint">
          <span className="hint-dot" style={{ background: activeColor }} />
          四圈四色 · 当前 {activeColorName}；点任意一瓣，整圈填当前色
        </div>
      </div>
    </>
  )
}
