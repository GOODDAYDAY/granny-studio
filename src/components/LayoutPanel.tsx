import {
  Minus,
  Paintbrush,
  Plus,
  RotateCw,
  Trash2,
} from 'lucide-react'
import {
  MAX_BOARD_CELLS,
  MAX_BOARD_DIM,
  occupiedCount,
} from '../domain/board'
import { FABRIC_SWATCHES } from '../domain/presets'
import { useStudio } from '../store/studio'
import DesignThumb from './DesignThumb'
import FillColorRow from './FillColorRow'

const PRESETS = [
  { label: '2 × 2', rows: 2, cols: 2 },
  { label: '3 × 4', rows: 3, cols: 4 },
  { label: '3 × 7', rows: 3, cols: 7 },
  { label: '4 × 4', rows: 4, cols: 4 },
  { label: '6 × 8', rows: 6, cols: 8 },
]

function Stepper({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <div className="stepper">
      <span>{label}</span>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`减少${label}`}
      >
        <Minus size={13} />
      </button>
      <strong>{value}</strong>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={`增加${label}`}
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

export default function LayoutPanel() {
  const board = useStudio((state) => state.project.board)
  const designs = useStudio((state) => state.project.designs)
  const activeDesign = useStudio((state) =>
    state.project.designs.find((item) => item.id === state.activeDesignId),
  )
  const selectedCell = useStudio((state) => state.selectedCell)
  const fill = useStudio((state) => state.project.fill ?? null)
  const boardTool = useStudio((state) => state.boardTool)
  const setBoardSize = useStudio((state) => state.setBoardSize)
  const setGap = useStudio((state) => state.setGap)
  const setFabric = useStudio((state) => state.setFabric)
  const setBoardTool = useStudio((state) => state.setBoardTool)
  const rotateCell = useStudio((state) => state.rotateCell)
  const clearCell = useStudio((state) => state.clearCell)
  const assignCell = useStudio((state) => state.assignCell)
  const fillBoard = useStudio((state) => state.fillBoard)
  const cycleBoard = useStudio((state) => state.cycleBoard)
  const clearBoard = useStudio((state) => state.clearBoard)
  const selectDesign = useStudio((state) => state.selectDesign)
  const setMode = useStudio((state) => state.setMode)

  const selectedPlacement = selectedCell ? board.cells[selectedCell] : undefined
  const selectedDesign = selectedPlacement
    ? designs.find((design) => design.id === selectedPlacement.designId)
    : undefined
  const occupied = occupiedCount(board)
  const total = board.rows * board.cols

  const editSelected = () => {
    if (!selectedDesign) return
    selectDesign(selectedDesign.id)
    setMode('square')
  }

  const clearSelected = () => {
    if (!selectedCell) return
    const [row, col] = selectedCell.split(':').map(Number)
    clearCell(row, col)
  }

  const rotateSelected = () => {
    if (!selectedCell) return
    const [row, col] = selectedCell.split(':').map(Number)
    rotateCell(row, col)
  }

  return (
    <section className="layout-panel">
      <div className="section-head">
        <div>
          <span className="eyebrow">LAYOUT</span>
          <h2>布局</h2>
        </div>
        <span className="section-count">
          {occupied} / {total}
        </span>
      </div>

      <div className="layout-block">
        <div className="layout-block-head">
          <span>尺寸</span>
          <span className="micro-hint">{board.rows * board.cols} 格</span>
        </div>
        <div className="stepper-row">
          <Stepper
            label="行"
            value={board.rows}
            min={1}
            max={MAX_BOARD_DIM}
            onChange={(value) => setBoardSize(value, board.cols)}
          />
          <Stepper
            label="列"
            value={board.cols}
            min={1}
            max={MAX_BOARD_DIM}
            onChange={(value) => setBoardSize(board.rows, value)}
          />
        </div>
        <div className="preset-row">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              className={`chip${
                board.rows === preset.rows && board.cols === preset.cols ? ' is-active' : ''
              }`}
              disabled={preset.rows * preset.cols > MAX_BOARD_CELLS}
              onClick={() => setBoardSize(preset.rows, preset.cols)}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="layout-block">
        <div className="layout-block-head">
          <span>填缝 / 底布</span>
          <span className="micro-hint">间距 {Math.round(board.gap * 100)}%</span>
        </div>
        <input
          className="range"
          type="range"
          min={0}
          max={0.12}
          step={0.005}
          value={board.gap}
          onChange={(event) => setGap(Number(event.target.value))}
          aria-label="方格间距"
        />
        <div className="sub-label">
          <span>底布</span>
          <span>{board.fabric.toUpperCase()}</span>
        </div>
        <div className="fabric-row">
          {FABRIC_SWATCHES.map((fabric) => (
            <button
              key={fabric}
              type="button"
              className={`fabric-swatch${
                board.fabric.toUpperCase() === fabric.toUpperCase() ? ' is-active' : ''
              }`}
              style={{ background: fabric }}
              onClick={() => setFabric(fabric)}
              aria-label={`底布颜色 ${fabric}`}
              title={fabric}
            />
          ))}
        </div>
        <FillColorRow />
      </div>

      <div className="layout-block">
        <div className="layout-block-head">
          <span>铺法</span>
          <span className="micro-hint">拖动可连续铺</span>
        </div>
        <div className="segmented" role="group" aria-label="铺格工具">
          <button
            type="button"
            className={boardTool === 'stamp' ? 'is-active' : ''}
            onClick={() => setBoardTool('stamp')}
          >
            盖方格
          </button>
          <button
            type="button"
            className={boardTool === 'select' ? 'is-active' : ''}
            onClick={() => setBoardTool('select')}
          >
            选中
          </button>
          <button
            type="button"
            className={boardTool === 'clear' ? 'is-active' : ''}
            onClick={() => setBoardTool('clear')}
          >
            清空格
          </button>
        </div>
        <div className="layout-actions">
          <button type="button" className="btn btn-soft" onClick={fillBoard}>
            铺满当前
          </button>
          <button type="button" className="btn btn-soft" onClick={cycleBoard}>
            循环铺色
          </button>
        </div>
        <button type="button" className="text-btn danger-text" onClick={clearBoard}>
          清空整板
        </button>
      </div>

      <div className="layout-block selected-block">
        <div className="layout-block-head">
          <span>选中格</span>
          {selectedCell && <span className="micro-hint">{selectedCell.replace(':', ' · ')}</span>}
        </div>
        {!selectedCell && (
          <p className="selected-empty">点毯子上的任意一格，可以旋转、清空或单独换一张。</p>
        )}
        {selectedCell && selectedDesign && (
          <div className="selected-card">
            <DesignThumb
              design={selectedDesign}
              prefix={`cell-${selectedDesign.id}`}
              className="cell-thumb"
              backing={fill}
            />
            <div className="selected-meta">
              <strong>{selectedDesign.name}</strong>
              <span>旋转 {selectedPlacement?.rotation ?? 0}°</span>
            </div>
            <div className="selected-actions">
              <button
                type="button"
                className="icon-btn bordered"
                onClick={rotateSelected}
                title="顺时针旋转 90°"
                aria-label="旋转选中格"
              >
                <RotateCw size={15} />
              </button>
              <button
                type="button"
                className="icon-btn bordered danger"
                onClick={clearSelected}
                title="清空这一格"
                aria-label="清空选中格"
              >
                <Trash2 size={15} />
              </button>
              <button
                type="button"
                className="icon-btn bordered"
                onClick={editSelected}
                title="在方格里编辑这张"
                aria-label="编辑这张方格"
              >
                <Paintbrush size={15} />
              </button>
            </div>
          </div>
        )}
        {selectedCell && !selectedDesign && (
          <div className="selected-card empty-cell-card">
            <span className="empty-cell-mark">空</span>
            <div className="selected-meta">
              <strong>空格子</strong>
              <span>放一张当前印章？</span>
            </div>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => {
                if (!selectedCell) return
                const [row, col] = selectedCell.split(':').map(Number)
                setBoardTool('stamp')
                assignCell(row, col)
              }}
            >
              放上
            </button>
          </div>
        )}
        {activeDesign && (
          <p className="micro-hint selected-hint">
            当前印章：{activeDesign.name}
          </p>
        )}
      </div>
    </section>
  )
}
