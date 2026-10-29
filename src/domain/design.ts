import {
  DEFAULT_BACKGROUND,
  FLOWER_PATTERN_ID,
  FLOWER_REGIONS,
  LAYERS,
  makeLayerColors,
  regionsOfLayer,
} from './patterns'
import type { Hex, LayerId, PuffPlacement, SquareDesign } from './types'

let fallbackId = 0

export function makeId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }
  fallbackId += 1
  return `${prefix}-${Date.now().toString(36)}-${fallbackId}`
}

export interface CreateDesignInput {
  name: string
  colors: Record<LayerId, Hex>
  background?: Hex
  puffPlacement?: PuffPlacement
  id?: string
  now?: number
}

export function createDesign(input: CreateDesignInput): SquareDesign {
  const now = input.now ?? Date.now()
  return {
    id: input.id ?? makeId('design'),
    name: input.name,
    patternId: FLOWER_PATTERN_ID,
    colors: makeLayerColors(input.colors),
    background: input.background ?? DEFAULT_BACKGROUND,
    puffPlacement: input.puffPlacement ?? 'outer',
    createdAt: now,
    updatedAt: now,
  }
}

export function setRegionColor(
  design: SquareDesign,
  regionId: string,
  hex: Hex,
): SquareDesign {
  if (!FLOWER_REGIONS.some((region) => region.id === regionId)) return design
  if (design.colors[regionId] === hex) return design
  return {
    ...design,
    colors: { ...design.colors, [regionId]: hex },
    updatedAt: Date.now(),
  }
}

export function fillLayer(design: SquareDesign, layer: LayerId, hex: Hex): SquareDesign {
  const colors = { ...design.colors }
  let changed = false
  for (const region of regionsOfLayer(layer)) {
    if (colors[region.id] !== hex) {
      colors[region.id] = hex
      changed = true
    }
  }
  if (!changed) return design
  return { ...design, colors, updatedAt: Date.now() }
}

export function applyLayerColors(
  design: SquareDesign,
  layerColors: Record<LayerId, Hex>,
): SquareDesign {
  let next = design
  for (const layer of LAYERS) {
    next = fillLayer(next, layer.id, layerColors[layer.id])
  }
  return next
}

export function getLayerColor(design: SquareDesign, layer: LayerId): Hex {
  const regions = regionsOfLayer(layer)
  return design.colors[regions[0]?.id ?? ''] ?? '#CCCCCC'
}

export function getLayerColors(design: SquareDesign): Hex[] {
  return LAYERS.map((layer) => getLayerColor(design, layer.id))
}

export function isLayerUniform(design: SquareDesign, layer: LayerId): boolean {
  const regions = regionsOfLayer(layer)
  if (regions.length === 0) return true
  const first = design.colors[regions[0].id]
  return regions.every((region) => design.colors[region.id] === first)
}

export function rotateLayerColors(design: SquareDesign): SquareDesign {
  const [center, puff, background, border] = getLayerColors(design)
  return applyLayerColors(design, {
    center: puff,
    puff: background,
    background: border,
    border: center,
  })
}

export function shuffleLayerColors(
  design: SquareDesign,
  random: () => number = Math.random,
): SquareDesign {
  const colors = getLayerColors(design)
  for (let index = colors.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[colors[index], colors[swapIndex]] = [colors[swapIndex], colors[index]]
  }
  return applyLayerColors(design, {
    center: colors[0],
    puff: colors[1],
    background: colors[2],
    border: colors[3],
  })
}

export function setPuffPlacement(
  design: SquareDesign,
  placement: PuffPlacement,
): SquareDesign {
  if (design.puffPlacement === placement) return design
  return { ...design, puffPlacement: placement, updatedAt: Date.now() }
}

export function setBackground(
  design: SquareDesign,
  hex: Hex,
): SquareDesign {
  if (design.background === hex) return design
  return { ...design, background: hex, updatedAt: Date.now() }
}

export function renameDesign(design: SquareDesign, name: string): SquareDesign {
  const nextName = name.trim() || design.name
  if (nextName === design.name) return design
  return { ...design, name: nextName, updatedAt: Date.now() }
}

export function duplicateDesign(design: SquareDesign, name?: string): SquareDesign {
  const now = Date.now()
  return {
    ...design,
    id: makeId('design'),
    name: name ?? `${design.name} 副本`,
    colors: { ...design.colors },
    createdAt: now,
    updatedAt: now,
  }
}
