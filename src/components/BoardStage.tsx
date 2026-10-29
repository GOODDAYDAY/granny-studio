import { Redo2, Undo2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { occupiedCount } from '../domain/board'
import { useStudio } from '../store/studio'
import BoardSvg from '../render/BoardSvg'

export default function BoardStage() {
  const board = useStudio((state) => state.project.board)
  const designs = useStudio((state) => state.project.designs)
  const selectedCell = useStudio((state) => state.selectedCell)
  const fill = useStudio((state) => state.project.fill ?? null)
  const activeDesign = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const assignCell = useStudio((state) => state.assignCell)
  const clearCell = useStudio((state) => state.clearCell)
  const undo = useStudio((state) => state.undo)
  const redo = useStudio((state) => state.redo)
  const canUndo = useStudio((state) => state.past.length > 0)
  const canRedo = useStudio((state) => state.future.length > 0)
  const painting = useRef(false)

  useEffect(() => {
    const stop = () => {
      painting.current = false
    }
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [])

  const occupied = occupiedCount(board)
  const total = board.rows * board.cols

  return (
    <>
      <div className="stage-top">
        <div className="stage-heading">
          <h1 className="stage-title">拼毯布局</h1>
          <p className="stage-sub">
            {board.rows} × {board.cols} · {occupied} / {total} 格
            {activeDesign && (
              <span className="stamp-chip">
                <i style={{ background: activeDesign.colors['border-0'] }} />
                印章：{activeDesign.name}
              </span>
            )}
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

      <div className="board-canvas">
        <BoardSvg
          board={board}
          designs={designs}
          selectedCell={selectedCell}
          interactive
          backing={fill}
          idPrefix="board"
          className="board-art"
          onCellDown={(row, col) => {
            painting.current = true
            assignCell(row, col)
          }}
          onCellEnter={(row, col) => {
            if (painting.current) assignCell(row, col)
          }}
          onCellContext={(row, col) => {
            painting.current = false
            clearCell(row, col)
          }}
        />
        {occupied === 0 && (
          <div className="board-empty-hint">
            从左边选一张方格，点格子开始铺
          </div>
        )}
      </div>

      <div className="stage-hint">
        拖动可连续铺 · 右键清空一格 · 「选中」工具只查看不改格
      </div>
    </>
  )
}
