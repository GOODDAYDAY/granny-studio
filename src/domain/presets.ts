import { createBoard } from './board'
import { createDesign } from './design'
import type { Hex, LayerId, PaletteColor, Project, SquareDesign } from './types'

export const PHOTO_COLORS = {
  pink: '#E5C3C7',
  cream: '#F2E9D9',
  brown: '#6E4A34',
  green: '#5A7054',
} as const

export const STARTER_SWATCHES: { hex: Hex; name: string }[] = [
  { hex: PHOTO_COLORS.pink, name: '藕粉' },
  { hex: PHOTO_COLORS.cream, name: '奶白' },
  { hex: PHOTO_COLORS.brown, name: '栗棕' },
  { hex: PHOTO_COLORS.green, name: '鼠尾草绿' },
  { hex: '#D8A545', name: '芥末黄' },
  { hex: '#B85C42', name: '陶土红' },
  { hex: '#6D8790', name: '雾蓝' },
  { hex: '#3C342D', name: '炭棕' },
]

export const FABRIC_SWATCHES: Hex[] = [
  '#E8DCC8',
  '#F2E7D3',
  '#D8BDA3',
  '#B9C4A8',
  '#B8AFA3',
]

export function makePalette(): PaletteColor[] {
  return STARTER_SWATCHES.map((swatch, index) => ({
    id: `swatch-${index + 1}`,
    hex: swatch.hex,
    name: swatch.name,
    source: 'preset',
  }))
}

export function makePresetDesigns(): SquareDesign[] {
  const now = Date.now()
  const { pink, cream, brown, green } = PHOTO_COLORS
  const colors = (center: Hex, puff: Hex, background: Hex, border: Hex) =>
    ({ center, puff, background, border }) satisfies Record<LayerId, Hex>

  return [
    createDesign({
      id: 'design-pink',
      name: '粉边白花',
      colors: colors(green, cream, brown, pink),
      puffPlacement: 'inner',
      now,
    }),
    createDesign({
      id: 'design-brown',
      name: '棕边白花',
      colors: colors(pink, cream, green, brown),
      puffPlacement: 'outer',
      now,
    }),
    createDesign({
      id: 'design-green',
      name: '绿边粉花',
      colors: colors(cream, pink, brown, green),
      puffPlacement: 'inner',
      now,
    }),
    createDesign({
      id: 'design-cream',
      name: '白边粉花',
      colors: colors(brown, pink, green, cream),
      puffPlacement: 'outer',
      now,
    }),
  ]
}

export function createDemoProject(): Project {
  const designs = makePresetDesigns()
  const board = createBoard(2, 2, FABRIC_SWATCHES[0])
  board.gap = 0.05
  board.cells = {
    '0:0': { designId: 'design-pink', rotation: 0 },
    '0:1': { designId: 'design-brown', rotation: 0 },
    '1:0': { designId: 'design-green', rotation: 0 },
    '1:1': { designId: 'design-cream', rotation: 0 },
  }
  return {
    schemaVersion: 1,
    palette: makePalette(),
    designs,
    board,
  }
}
