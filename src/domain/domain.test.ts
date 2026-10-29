import { describe, expect, it } from 'vitest'
import {
  assignCell,
  clearCell,
  countDesignUsage,
  createBoard,
  cycleDesigns,
  fillBoard,
  fillEmptyCells,
  occupiedCount,
  resizeBoard,
  rotateCell,
} from './board'
import { adjustLightness, describeColor, hexToRgb, normalizeHex, rgbToHex } from './color'
import {
  createDesign,
  duplicateDesign,
  fillLayer,
  getLayerColors,
  isLayerUniform,
  rotateLayerColors,
  setPuffPlacement,
  setRegionColor,
  shuffleLayerColors,
} from './design'
import { flowerGeometry } from './geometry'
import { FLOWER_REGIONS, LAYERS, makeLayerColors, regionsOfLayer } from './patterns'
import { createDemoProject, makePresetDesigns } from './presets'
import { isValidProject } from '../store/persist'
import type { LayerId, Project } from './types'

const layerColors: Record<LayerId, string> = {
  center: '#112233',
  puff: '#223344',
  background: '#334455',
  border: '#445566',
}

const design = createDesign({
  name: '测试方格',
  colors: layerColors,
  puffPlacement: 'inner',
})

describe('flower pattern', () => {
  it('has the expected regions', () => {
    expect(regionsOfLayer('center')).toHaveLength(6)
    expect(regionsOfLayer('puff')).toHaveLength(8)
    expect(regionsOfLayer('background')).toHaveLength(16)
    expect(regionsOfLayer('border')).toHaveLength(16)
    expect(FLOWER_REGIONS).toHaveLength(46)
    expect(new Set(FLOWER_REGIONS.map((region) => region.id)).size).toBe(46)
    expect(LAYERS).toHaveLength(4)
  })

  it('maps layer colors to every region', () => {
    const colors = makeLayerColors(layerColors)
    for (const region of FLOWER_REGIONS) {
      expect(colors[region.id]).toBe(layerColors[region.layer])
    }
  })

  it('builds both puff layer orders', () => {
    const inner = flowerGeometry('inner')
    const outer = flowerGeometry('outer')
    expect(inner.petals).toHaveLength(6)
    expect(inner.puffs).toHaveLength(8)
    expect(inner.clusters).toHaveLength(16)
    expect(inner.border).toHaveLength(16)
    expect(inner.cornerHoles).toHaveLength(0)

    const innerPuff = Math.hypot(inner.puffs[0].cx, inner.puffs[0].cy)
    const innerBackground = Math.hypot(inner.clusters[0].cx, inner.clusters[0].cy)
    expect(innerPuff).toBeLessThan(innerBackground)

    const outerPuff = Math.hypot(outer.puffs[0].cx, outer.puffs[0].cy)
    const outerBackground = Math.hypot(outer.clusters[0].cx, outer.clusters[0].cy)
    expect(outerPuff).toBeGreaterThan(outerBackground)
  })
})

describe('design operations', () => {
  it('creates a complete design', () => {
    expect(Object.keys(design.colors)).toHaveLength(46)
    expect(getLayerColors(design)).toEqual([
      '#112233',
      '#223344',
      '#334455',
      '#445566',
    ])
    for (const layer of LAYERS) {
      expect(isLayerUniform(design, layer.id)).toBe(true)
    }
  })

  it('paints one region without touching the rest of the layer', () => {
    const next = setRegionColor(design, 'petal-0', '#ABCDEF')
    expect(next.colors['petal-0']).toBe('#ABCDEF')
    expect(next.colors['petal-1']).toBe(layerColors.center)
    expect(isLayerUniform(next, 'center')).toBe(false)
  })

  it('fills a whole layer', () => {
    const next = fillLayer(design, 'background', '#000000')
    for (const region of regionsOfLayer('background')) {
      expect(next.colors[region.id]).toBe('#000000')
    }
    expect(next.colors['petal-0']).toBe(layerColors.center)
  })

  it('rotates colors between the four layers', () => {
    const next = rotateLayerColors(design)
    expect(getLayerColors(next)).toEqual([
      '#223344',
      '#334455',
      '#445566',
      '#112233',
    ])
    expect(next.colors['petal-0']).toBe('#223344')
  })

  it('shuffles without losing colors', () => {
    const next = shuffleLayerColors(design, () => 0.4)
    expect([...getLayerColors(next)].sort()).toEqual(
      [...Object.values(layerColors)].sort(),
    )
    expect(next).not.toBe(design)
  })

  it('changes puff placement and duplicates cleanly', () => {
    const next = setPuffPlacement(design, 'outer')
    expect(next.puffPlacement).toBe('outer')
    const copy = duplicateDesign(design)
    expect(copy.id).not.toBe(design.id)
    expect(copy.colors).toEqual(design.colors)
    expect(copy.colors).not.toBe(design.colors)
  })
})

describe('board operations', () => {
  it('assigns, rotates and clears', () => {
    let board = createBoard(2, 2)
    board = assignCell(board, 0, 0, 'a')
    board = assignCell(board, 1, 1, 'b')
    expect(occupiedCount(board)).toBe(2)
    board = rotateCell(board, 0, 0)
    expect(board.cells['0:0'].rotation).toBe(90)
    board = clearCell(board, 1, 1)
    expect(board.cells['1:1']).toBeUndefined()
  })

  it('preserves hidden cells across a resize', () => {
    let board = createBoard(3, 3)
    board = assignCell(board, 2, 2, 'corner')
    board = resizeBoard(board, 1, 1)
    expect(board.cells['2:2']).toBeDefined()
    board = resizeBoard(board, 3, 3)
    expect(board.cells['2:2'].designId).toBe('corner')
  })

  it('fills empty cells, the whole board and cycles designs', () => {
    let board = createBoard(2, 2)
    board = assignCell(board, 0, 0, 'a')
    board = fillEmptyCells(board, 'b')
    expect(occupiedCount(board)).toBe(4)
    expect(board.cells['0:1'].designId).toBe('b')

    const filled = fillBoard(board, 'z')
    expect(countDesignUsage(filled, 'z')).toBe(4)

    const cycled = cycleDesigns(filled, ['x', 'y'])
    expect(cycled.cells['0:0'].designId).toBe('x')
    expect(cycled.cells['0:1'].designId).toBe('y')
    expect(cycled.cells['1:0'].designId).toBe('x')
    expect(cycled.cells['1:1'].designId).toBe('y')
  })

  it('keeps per-cell fill colors through design changes', () => {
    let board = createBoard(2, 2)
    board = assignCell(board, 0, 0, 'a', 0, '#112233')
    expect(board.cells['0:0'].fill).toBe('#112233')

    board = rotateCell(board, 0, 0)
    expect(board.cells['0:0'].fill).toBe('#112233')

    const filled = fillBoard(board, 'z')
    expect(filled.cells['0:0'].fill).toBe('#112233')

    const cycled = cycleDesigns(filled, ['x', 'y'])
    expect(cycled.cells['0:0'].fill).toBe('#112233')
    expect(cycled.cells['0:1'].fill).toBeUndefined()
  })

  it('clamps dimensions', () => {
    const board = resizeBoard(createBoard(2, 2), 99, 0)
    expect(board.rows).toBe(24)
    expect(board.cols).toBe(1)
  })
})

describe('demo project', () => {
  it('starts with four colorways and a 2x2 board', () => {
    const project = createDemoProject()
    expect(project.designs).toHaveLength(4)
    expect(project.board.rows).toBe(2)
    expect(project.board.cols).toBe(2)
    expect(occupiedCount(project.board)).toBe(4)
    expect(project.fill).toBeNull()
    expect(project.palette.length).toBeGreaterThanOrEqual(4)
    for (const item of project.designs) {
      expect(Object.keys(item.colors)).toHaveLength(46)
      for (const layer of LAYERS) {
        expect(isLayerUniform(item, layer.id)).toBe(true)
      }
    }
  })

  it('validates persisted projects', () => {
    const project = createDemoProject()
    expect(isValidProject(project)).toBe(true)
    expect(isValidProject({ ...project, schemaVersion: 2 })).toBe(false)
    expect(isValidProject({ schemaVersion: 1 } as Project)).toBe(false)
  })

  it('makes the four photo colorways in both layer orders', () => {
    const designs = makePresetDesigns()
    expect(designs.map((item) => item.puffPlacement)).toEqual([
      'inner',
      'outer',
      'inner',
      'outer',
    ])
  })
})

describe('color helpers', () => {
  it('normalizes and converts hex', () => {
    expect(normalizeHex('#abc')).toBe('#AABBCC')
    expect(normalizeHex('12abEF')).toBe('#12ABEF')
    expect(normalizeHex('nope')).toBeNull()
    expect(hexToRgb('#112233')).toEqual({ r: 17, g: 34, b: 51 })
    expect(rgbToHex(17, 34, 51)).toBe('#112233')
  })

  it('adjusts lightness and names colors', () => {
    expect(adjustLightness('#808080', 20)).not.toBe('#808080')
    expect(describeColor('#F2E9D9')).toBe('奶白')
    expect(describeColor('#3A3027').length).toBeGreaterThan(0)
  })
})
