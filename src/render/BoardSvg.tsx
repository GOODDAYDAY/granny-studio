import { ColorDefs, FlowerShapes } from './FlowerSvg'
import { isDark } from '../domain/color'
import { FLOWER_VIEW_BOX, FLOWER_VIEW_SIZE } from '../domain/geometry'
import type { Board, SquareDesign } from '../domain/types'

export interface BoardSvgProps {
  board: Board
  designs: SquareDesign[]
  selectedCell?: string | null
  interactive?: boolean
  backing?: string | null
  onCellDown?: (row: number, col: number) => void
  onCellEnter?: (row: number, col: number) => void
  onCellContext?: (row: number, col: number) => void
  className?: string
  idPrefix?: string
}

export default function BoardSvg({
  board,
  designs,
  selectedCell = null,
  interactive = false,
  backing = null,
  onCellDown,
  onCellEnter,
  onCellContext,
  className,
  idPrefix = 'board',
}: BoardSvgProps) {
  const designMap = new Map(designs.map((design) => [design.id, design]))
  const tile = FLOWER_VIEW_SIZE
  const gap = Math.min(0.14, Math.max(0, board.gap)) * tile
  const pad = tile * 0.34
  const width = board.cols * tile + Math.max(0, board.cols - 1) * gap + pad * 2
  const height = board.rows * tile + Math.max(0, board.rows - 1) * gap + pad * 2
  const total = board.rows * board.cols
  const detail = total <= 150
  const fabricInset = pad * 0.3
  const fabricWidth = width - fabricInset * 2
  const fabricHeight = height - fabricInset * 2
  const gridWidth = board.cols * tile + Math.max(0, board.cols - 1) * gap
  const gridHeight = board.rows * tile + Math.max(0, board.rows - 1) * gap
  const seamStitch = backing
    ? isDark(backing)
      ? 'rgba(255,248,236,.26)'
      : 'rgba(52,34,20,.2)'
    : 'rgba(52,34,20,.2)'

  const positions: { row: number; col: number; x: number; y: number }[] = []
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      positions.push({
        row,
        col,
        x: pad + col * (tile + gap),
        y: pad + row * (tile + gap),
      })
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={['board-svg', className].filter(Boolean).join(' ')}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`拼毯布局，${board.rows} 行 ${board.cols} 列`}
    >
      <defs>
        <pattern
          id={`${idPrefix}-linen`}
          width=".2"
          height=".2"
          patternUnits="userSpaceOnUse"
        >
          <path d="M0 .1 H.2" stroke="#000" strokeOpacity=".028" strokeWidth=".012" />
          <path d="M.1 0 V.2" stroke="#000" strokeOpacity=".018" strokeWidth=".012" />
        </pattern>
        {designs.map((design) => (
          <ColorDefs
            key={`defs-${design.id}`}
            design={design}
            prefix={`${idPrefix}-${design.id}`}
          />
        ))}
        {designs.map((design) => (
          <symbol
            key={`symbol-${design.id}`}
            id={`${idPrefix}-sq-${design.id}`}
            viewBox={FLOWER_VIEW_BOX}
          >
            <FlowerShapes
              design={design}
              prefix={`${idPrefix}-${design.id}`}
              detail={detail}
              backing={backing}
            />
          </symbol>
        ))}
        <filter
          id={`${idPrefix}-shadow`}
          x="-12%"
          y="-12%"
          width="124%"
          height="128%"
        >
          <feDropShadow
            dx="0"
            dy="0.36"
            stdDeviation="0.5"
            floodColor="#4A3220"
            floodOpacity="0.18"
          />
        </filter>
      </defs>

      <g filter={`url(#${idPrefix}-shadow)`}>
        <rect
          x={fabricInset}
          y={fabricInset}
          width={fabricWidth}
          height={fabricHeight}
          rx={tile * 0.16}
          fill={board.fabric}
        />
        <rect
          x={fabricInset}
          y={fabricInset}
          width={fabricWidth}
          height={fabricHeight}
          rx={tile * 0.16}
          fill={`url(#${idPrefix}-linen)`}
        />
        <rect
          x={fabricInset}
          y={fabricInset}
          width={fabricWidth}
          height={fabricHeight}
          rx={tile * 0.16}
          fill="none"
          stroke="rgba(255,255,255,.34)"
          strokeWidth={0.055}
        />

        {backing && (
          <>
            <rect x={pad} y={pad} width={gridWidth} height={gridHeight} fill={backing} />
            {Array.from({ length: Math.max(0, board.cols - 1) }, (_, index) => {
              const x = pad + (index + 1) * tile + index * gap + gap / 2
              return (
                <line
                  key={`seam-v-${index}`}
                  x1={x}
                  y1={pad}
                  x2={x}
                  y2={pad + gridHeight}
                  stroke={seamStitch}
                  strokeWidth={0.035}
                  strokeDasharray=".14 .12"
                />
              )
            })}
            {Array.from({ length: Math.max(0, board.rows - 1) }, (_, index) => {
              const y = pad + (index + 1) * tile + index * gap + gap / 2
              return (
                <line
                  key={`seam-h-${index}`}
                  x1={pad}
                  y1={y}
                  x2={pad + gridWidth}
                  y2={y}
                  stroke={seamStitch}
                  strokeWidth={0.035}
                  strokeDasharray=".14 .12"
                />
              )
            })}
          </>
        )}

        {positions.map(({ row, col, x, y }) => {
          const placement = board.cells[`${row}:${col}`]
          const design = placement ? designMap.get(placement.designId) : undefined
          if (!placement || !design) return null
          return (
            <g
              key={`tile-${row}-${col}`}
              transform={`translate(${x + tile / 2} ${y + tile / 2}) rotate(${placement.rotation})`}
            >
              <use
                href={`#${idPrefix}-sq-${design.id}`}
                x={-tile / 2}
                y={-tile / 2}
                width={tile}
                height={tile}
              />
            </g>
          )
        })}
      </g>

      {interactive &&
        positions.map(({ row, col, x, y }) => {
          const placement = board.cells[`${row}:${col}`]
          const design = placement ? designMap.get(placement.designId) : undefined
          const empty = !placement || !design
          return (
            <g key={`cell-${row}-${col}`}>
              {empty && (
                <rect
                  x={x + 0.22}
                  y={y + 0.22}
                  width={tile - 0.44}
                  height={tile - 0.44}
                  rx={0.18}
                  fill="rgba(255,255,255,.035)"
                  stroke="rgba(92,70,49,.18)"
                  strokeWidth={0.035}
                  strokeDasharray="0.16 0.18"
                  pointerEvents="none"
                />
              )}
              <rect
                className={`board-cell-hit${selectedCell === `${row}:${col}` ? ' selected' : ''}`}
                data-cell={`${row}:${col}`}
                x={x}
                y={y}
                width={tile}
                height={tile}
                rx={0.12}
                fill="transparent"
                onPointerDown={() => onCellDown?.(row, col)}
                onPointerEnter={() => onCellEnter?.(row, col)}
                onContextMenu={(event) => {
                  event.preventDefault()
                  onCellContext?.(row, col)
                }}
              />
            </g>
          )
        })}
    </svg>
  )
}
