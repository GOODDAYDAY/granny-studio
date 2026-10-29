import { Copy, Plus, Trash2 } from 'lucide-react'
import { countDesignUsage } from '../domain/board'
import { getLayerColors } from '../domain/design'
import type { SquareDesign } from '../domain/types'
import { useStudio } from '../store/studio'
import DesignThumb from './DesignThumb'

export default function DesignLibrary() {
  const designs = useStudio((state) => state.project.designs)
  const board = useStudio((state) => state.project.board)
  const activeDesignId = useStudio((state) => state.activeDesignId)
  const mode = useStudio((state) => state.mode)
  const selectDesign = useStudio((state) => state.selectDesign)
  const addDesign = useStudio((state) => state.addDesign)
  const duplicateDesign = useStudio((state) => state.duplicateDesign)
  const deleteDesign = useStudio((state) => state.deleteDesign)
  const requestConfirm = useStudio((state) => state.requestConfirm)
  const resetDemo = useStudio((state) => state.resetDemo)

  const askDelete = (design: SquareDesign) => {
    if (designs.length <= 1) return
    const usage = countDesignUsage(board, design.id)
    requestConfirm({
      title: `删除「${design.name}」？`,
      body:
        usage > 0
          ? `布局里用了 ${usage} 格。删除后这些格子会被清空，之后可以用撤销找回。`
          : '这个方格会从项目里移除，之后可以用撤销找回。',
      confirmLabel: '删除',
      tone: 'danger',
      onConfirm: () => deleteDesign(design.id),
    })
  }

  const askReset = () => {
    requestConfirm({
      title: '恢复示例项目？',
      body: '当前的方格和布局会被七款示例替换。这一步可以用撤销找回。',
      confirmLabel: '恢复示例',
      onConfirm: () => resetDemo(),
    })
  }

  return (
    <section className="library">
      <div className="section-head">
        <div>
          <span className="eyebrow">MY SQUARES · {designs.length}</span>
          <h2>我的方格</h2>
        </div>
        <button
          type="button"
          className="icon-btn bordered"
          onClick={addDesign}
          title="新建一个方格配色"
          aria-label="新建方格"
        >
          <Plus size={17} />
        </button>
      </div>

      {mode === 'board' && <p className="library-tip">选一张做印章，再点格子盖上。</p>}

      <div className="design-list">
        {designs.map((design) => {
          const active = design.id === activeDesignId
          const colors = getLayerColors(design)
          return (
            <div
              key={design.id}
              className={`design-card${active ? ' is-active' : ''}`}
              role="button"
              tabIndex={0}
              aria-pressed={active}
              aria-label={`${design.name}，${active ? '当前选中' : '点击选择'}`}
              onClick={() => selectDesign(design.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  selectDesign(design.id)
                }
              }}
            >
              <DesignThumb
                design={design}
                prefix={`thumb-${design.id}`}
                className="design-thumb-small"
              />
              <div className="design-meta">
                <span className="design-name">{design.name}</span>
                <span className="design-sub">
                  {design.puffPlacement === 'inner' ? '外瓣在里' : '外瓣在外'}
                </span>
                <span className="layer-dots" aria-hidden="true">
                  {colors.map((hex, index) => (
                    <i key={`${hex}-${index}`} style={{ background: hex }} />
                  ))}
                </span>
              </div>
              {active && (
                <span className="card-badge">{mode === 'board' ? '印章' : '编辑中'}</span>
              )}
              <div className="design-actions">
                <button
                  type="button"
                  className="mini-icon"
                  title="复制这张方格"
                  aria-label={`复制 ${design.name}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    duplicateDesign(design.id)
                  }}
                >
                  <Copy size={14} />
                </button>
                <button
                  type="button"
                  className="mini-icon danger"
                  title={designs.length <= 1 ? '至少保留一张方格' : '删除这张方格'}
                  aria-label={`删除 ${design.name}`}
                  disabled={designs.length <= 1}
                  onClick={(event) => {
                    event.stopPropagation()
                    askDelete(design)
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="library-note">
        <span className="eyebrow">四色轮换</span>
        <p>这些示例来自参考照片，每款四圈四色。选中一款，点「四色轮换」试其他排法。</p>
      </div>

      <div className="library-foot">
        <button type="button" className="text-btn" onClick={askReset}>
          恢复示例项目
        </button>
        <span>自动保存在本机</span>
      </div>
    </section>
  )
}
