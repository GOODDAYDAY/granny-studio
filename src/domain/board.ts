import type { Board, Hex, Placement, Rotation } from './types'

export const MIN_BOARD_DIM = 1
export const MAX_BOARD_DIM = 24
export const MAX_BOARD_CELLS = 576

export function cellKey(row: number, col: number): string {
  return `${row}:${col}`
}

export function createBoard(rows: number, cols: number, fabric: Hex = '#E8DCC8'): Board {
  return {
    rows: clampDim(rows),
    cols: clampDim(cols),
    gap: 0.05,
    fabric,
    cells: {},
  }
}

export function clampDim(value: number): number {
  if (!Number.isFinite(value)) return MIN_BOARD_DIM
  return Math.min(MAX_BOARD_DIM, Math.max(MIN_BOARD_DIM, Math.round(value)))
}

export function resizeBoard(board: Board, rows: number, cols: number): Board {
  return { ...board, rows: clampDim(rows), cols: clampDim(cols) }
}

export function getPlacement(board: Board, row: number, col: number): Placement | undefined {
  return board.cells[cellKey(row, col)]
}

export function isInBounds(board: Board, row: number, col: number): boolean {
  return row >= 0 && col >= 0 && row < board.rows && col < board.cols
}

export function assignCell(
  board: Board,
  row: number,
  col: number,
  designId: string,
  rotation: Rotation = 0,
): Board {
  if (!isInBounds(board, row, col)) return board
  return {
    ...board,
    cells: {
      ...board.cells,
      [cellKey(row, col)]: { designId, rotation },
    },
  }
}

export function clearCell(board: Board, row: number, col: number): Board {
  if (!isInBounds(board, row, col)) return board
  const key = cellKey(row, col)
  if (!board.cells[key]) return board
  const cells = { ...board.cells }
  delete cells[key]
  return { ...board, cells }
}

export function rotateCell(board: Board, row: number, col: number): Board {
  const key = cellKey(row, col)
  const placement = board.cells[key]
  if (!placement) return board
  return {
    ...board,
    cells: {
      ...board.cells,
      [key]: {
        ...placement,
        rotation: ((placement.rotation + 90) % 360) as Rotation,
      },
    },
  }
}

export function fillEmptyCells(
  board: Board,
  designId: string,
  rotation: Rotation = 0,
): Board {
  const cells = { ...board.cells }
  let changed = false
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      const key = cellKey(row, col)
      if (!cells[key]) {
        cells[key] = { designId, rotation }
        changed = true
      }
    }
  }
  return changed ? { ...board, cells } : board
}

export function fillBoard(board: Board, designId: string): Board {
  const cells: Record<string, Placement> = {}
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      cells[cellKey(row, col)] = { designId, rotation: 0 }
    }
  }
  return { ...board, cells }
}

export function clearBoard(board: Board): Board {
  return { ...board, cells: {} }
}

export function cycleDesigns(board: Board, designIds: string[]): Board {
  if (designIds.length === 0) return board
  const cells: Record<string, Placement> = {}
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      const designId = designIds[(row * board.cols + col) % designIds.length]
      cells[cellKey(row, col)] = { designId, rotation: 0 }
    }
  }
  return { ...board, cells }
}

export function countDesignUsage(board: Board, designId: string): number {
  return Object.values(board.cells).filter((cell) => cell.designId === designId).length
}

export function occupiedCount(board: Board): number {
  let count = 0
  for (let row = 0; row < board.rows; row += 1) {
    for (let col = 0; col < board.cols; col += 1) {
      if (board.cells[cellKey(row, col)]) count += 1
    }
  }
  return count
}

export function rotateDirection(rotation: Rotation): Rotation {
  return ((rotation + 90) % 360) as Rotation
}
