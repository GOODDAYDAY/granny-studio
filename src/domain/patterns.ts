import type { Hex, LayerId, PatternRegion } from './types'

export const FLOWER_PATTERN_ID = 'flower-6-8'

export interface LayerMeta {
  id: LayerId
  name: string
  hint: string
  count: number
}

export const LAYERS: LayerMeta[] = [
  { id: 'center', name: '第1圈', hint: '花心 · 6 瓣', count: 6 },
  { id: 'puff', name: '第2圈', hint: '外瓣 · 8 瓣', count: 8 },
  { id: 'background', name: '第3圈', hint: '底针 · 16 针', count: 16 },
  { id: 'border', name: '第4圈', hint: '边框 · 16 段', count: 16 },
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
