export type Hex = string

export type PuffPlacement = 'inner' | 'outer'

export type LayerId = 'center' | 'puff' | 'background' | 'border'

export type Rotation = 0 | 90 | 180 | 270

export type Mode = 'square' | 'board'

export interface PaletteColor {
  id: string
  hex: Hex
  name: string
  source: 'preset' | 'image' | 'custom'
}

export interface PatternRegion {
  id: string
  layer: LayerId
  index: number
}

export interface SquareDesign {
  id: string
  name: string
  patternId: string
  colors: Record<string, Hex>
  /** Background inside the outer border — the white area inside the frame. */
  background: Hex
  puffPlacement: PuffPlacement
  createdAt: number
  updatedAt: number
}

export interface Placement {
  designId: string
  rotation: Rotation
}

export interface Board {
  rows: number
  cols: number
  /** 0–0.14, relative to a tile. */
  gap: number
  fabric: Hex
  /** Sparse map keyed by "row:col"; cells outside the current size survive a resize. */
  cells: Record<string, Placement>
}

export interface Project {
  schemaVersion: 1
  palette: PaletteColor[]
  designs: SquareDesign[]
  board: Board
}
