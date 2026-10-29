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
  { hex: '#1E4E79', name: '深海蓝' },
  { hex: '#C63A32', name: '砖红' },
  { hex: '#2E547F', name: '牛仔蓝' },
  { hex: '#A8C9E8', name: '浅雾蓝' },
  { hex: '#6E6A6A', name: '暖灰' },
  { hex: '#14532D', name: '墨绿' },
  { hex: '#F1D879', name: '鹅黄' },
  { hex: '#7EA477', name: '豆绿' },
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
      id: 'design-mint',
      name: '绿蓝粉白',
      colors: colors('#14532D', '#A8C9E8', pink, cream),
      now,
    }),
    createDesign({
      id: 'design-berry',
      name: '红白绿',
      colors: colors('#C63A32', '#C63A32', cream, '#14532D'),
      now,
    }),
    createDesign({
      id: 'design-flag',
      name: '蓝白红',
      colors: colors('#1E4E79', cream, '#C63A32', '#2E547F'),
      now,
    }),
    createDesign({
      id: 'design-slate',
      name: '灰蓝白',
      colors: colors('#1C4B56', '#A8C9E8', cream, '#6E6A6A'),
      now,
    }),
    createDesign({
      id: 'design-meadow',
      name: '绿黄白',
      colors: colors('#14532D', '#F1D879', cream, '#7EA477'),
      now,
    }),
    createDesign({
      id: 'design-pink',
      name: '粉边白花',
      colors: colors(green, cream, brown, pink),
      now,
    }),
    createDesign({
      id: 'design-brown',
      name: '棕边白花',
      colors: colors(pink, cream, green, brown),
      now,
    }),
    createDesign({
      id: 'design-green',
      name: '绿边粉花',
      colors: colors(cream, pink, brown, green),
      now,
    }),
    createDesign({
      id: 'design-cream',
      name: '白边粉花',
      colors: colors(brown, pink, green, cream),
      now,
    }),
  ]
}

export function createDemoProject(): Project {
  const designs = makePresetDesigns()
  const board = createBoard(2, 2, FABRIC_SWATCHES[0])
  board.gap = 0.05
  board.cells = {
    '0:0': { designId: 'design-mint', rotation: 0 },
    '0:1': { designId: 'design-berry', rotation: 0 },
    '1:0': { designId: 'design-flag', rotation: 0 },
    '1:1': { designId: 'design-slate', rotation: 0 },
  }
  return {
    schemaVersion: 1,
    palette: makePalette(),
    designs,
    board,
  }
}
