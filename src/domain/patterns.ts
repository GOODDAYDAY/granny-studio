import type { GapLayer, Hex, LayerId, PatternRegion } from './types'

export const FLOWER_PATTERN_ID = 'flower-6-8'

export interface LayerMeta {
  id: LayerId
  name: string
  hint: string
  count: number
}

export interface GapLayerMeta {
  id: GapLayer
  name: string
  hint: string
}

/** Four concentric negative-space layers inside one square. */
export const GAP_LAYERS: GapLayerMeta[] = [
  { id: 'center', name: '中心', hint: '花心内空隙' },
  { id: 'inner', name: '内圈', hint: '外瓣与底针之间' },
  { id: 'mid', name: '中圈', hint: '底针与边框之间' },
  { id: 'outer', name: '外圈', hint: '边框与四角' },
]

/** Neutral linen shadows so a fresh square already reads as a solid piece. */
export const DEFAULT_GAP_COLORS: Record<GapLayer, Hex> = {
  center: '#F4EADB',
  inner: '#EFE3D2',
  mid: '#E9DCC9',
  outer: '#E2D3BE',
}

export const LAYERS: LayerMeta[] = [
  { id: 'center', name: '花心', hint: '6 瓣小花瓣', count: 6 },
  { id: 'puff', name: '外瓣', hint: '8 片鼓针', count: 8 },
  { id: 'background', name: '底针', hint: '16 组 3 长针', count: 16 },
  { id: 'border', name: '边框', hint: '每边 4 组', count: 16 },
]

const centerRegions: PatternRegion[] = Array.from({ length: 6 }, (_, index) => ({
  id: `petal-${index}`,
  layer: 'center',
  index,
}))

const puffRegions: PatternRegion[] = Array.from({ length: 8 }, (_, index) => ({
  id: `puff-${index}`,
  layer: 'puff',
  index,
}))

const backgroundRegions: PatternRegion[] = Array.from({ length: 16 }, (_, index) => ({
  id: `bg-${index}`,
  layer: 'background',
  index,
}))

const borderRegions: PatternRegion[] = Array.from({ length: 16 }, (_, index) => ({
  id: `border-${index}`,
  layer: 'border',
  index,
}))

export const FLOWER_REGIONS: PatternRegion[] = [
  ...centerRegions,
  ...puffRegions,
  ...backgroundRegions,
  ...borderRegions,
]

const regionsByLayer = new Map<LayerId, PatternRegion[]>()
for (const region of FLOWER_REGIONS) {
  const list = regionsByLayer.get(region.layer) ?? []
  list.push(region)
  regionsByLayer.set(region.layer, list)
}

export function regionsOfLayer(layer: LayerId): PatternRegion[] {
  return regionsByLayer.get(layer) ?? []
}

export const LAYER_BY_ID = new Map(LAYERS.map((layer) => [layer.id, layer]))

export interface PatternDefinition {
  id: string
  name: string
  regions: PatternRegion[]
}

export const PATTERNS: Record<string, PatternDefinition> = {
  [FLOWER_PATTERN_ID]: {
    id: FLOWER_PATTERN_ID,
    name: '六瓣花方格',
    regions: FLOWER_REGIONS,
  },
}

export function makeLayerColors(colors: Record<LayerId, Hex>): Record<string, Hex> {
  const result: Record<string, Hex> = {}
  for (const region of FLOWER_REGIONS) {
    result[region.id] = colors[region.layer]
  }
  return result
}
