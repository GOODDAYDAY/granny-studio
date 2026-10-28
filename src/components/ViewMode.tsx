import { ArrowLeft } from 'lucide-react'
import { useStudio } from '../store/studio'
import BoardSvg from '../render/BoardSvg'

export default function ViewMode() {
  const board = useStudio((state) => state.project.board)
  const designs = useStudio((state) => state.project.designs)
  const closeView = useStudio((state) => state.closeView)

  return (
    <div className="view-mode">
      <div className="view-top">
        <button type="button" className="btn btn-ghost view-back" onClick={closeView}>
          <ArrowLeft size={16} />
          返回
        </button>
        <span className="view-brand">织色间 · 看看</span>
        <span className="view-count">
          {board.rows} × {board.cols}
        </span>
      </div>

      <div className="view-board-wrap">
        <BoardSvg
          board={board}
          designs={designs}
          idPrefix="view"
          className="view-board"
        />
      </div>

      <div className="view-bottom">退后一步，看整条毯子 · 按 Esc 退出</div>
    </div>
  )
}
