import type { LayerId, PuffPlacement } from './types'

export const FLOWER_VIEW_SIZE = 9.2
export const FLOWER_HALF = FLOWER_VIEW_SIZE / 2
export const FLOWER_VIEW_BOX = `${-FLOWER_HALF} ${-FLOWER_HALF} ${FLOWER_VIEW_SIZE} ${FLOWER_VIEW_SIZE}`

/** Background inside the outer border; tucked under the border edge. */
export const BACKGROUND_RECT = {
  x: -3.95,
  y: -3.95,
  width: 7.9,
  height: 7.9,
  rx: 0.55,
}

const RAD = Math.PI / 180

export interface RadialPiece {
  regionId: string
  layer: LayerId
  kind: 'petal' | 'puff' | 'cluster'
  cx: number
  cy: number
  rotation: number
  length: number
  width: number
}

export interface BorderPiece {
  regionId: string
  layer: 'border'
  cx: number
  cy: number
  rotation: number
  length: number
  width: number
}

export interface FlowerGeometry {
  petals: RadialPiece[]
  puffs: RadialPiece[]
  clusters: RadialPiece[]
  border: BorderPiece[]
  centerHole: { radius: number }
  cornerHoles: { cx: number; cy: number; radius: number }[]
  viewBox: string
}

function radialPiece(
  regionId: string,
  layer: LayerId,
  kind: RadialPiece['kind'],
  angleDeg: number,
  radius: number,
  length: number,
  width: number,
): RadialPiece {
  const angle = angleDeg * RAD
  return {
    regionId,
    layer,
    kind,
    cx: Math.cos(angle) * radius,
    cy: Math.sin(angle) * radius,
    rotation: angleDeg + 90,
    length,
    width,
  }
}

export function flowerGeometry(placement: PuffPlacement): FlowerGeometry {
  const petals = Array.from({ length: 6 }, (_, index) =>
    radialPiece(
      `petal-${index}`,
      'center',
      'petal',
      -90 + index * 60,
      0.82,
      1.28,
      1.02,
    ),
  )

  const puffRadius = placement === 'inner' ? 2.2 : 2.75
  const clusterRadius = placement === 'inner' ? 2.75 : 2.2

  const puffs = Array.from({ length: 8 }, (_, index) =>
    radialPiece(
      `puff-${index}`,
      'puff',
      'puff',
      -90 + index * 45,
      puffRadius,
      1.28,
      1.06,
    ),
  )

  const clusters = Array.from({ length: 16 }, (_, index) =>
    radialPiece(
      `bg-${index}`,
      'background',
      'cluster',
      -78.75 + index * 22.5,
      clusterRadius,
      1.35,
      1.12,
    ),
  )

  const b = 4
  const borderLength = 1.9
  const borderWidth = 0.88
  const cornerGap = 0
  const a = b - cornerGap - borderLength / 2
  const step = (2 * a) / 3
  const border: BorderPiece[] = []

  for (let side = 0; side < 4; side += 1) {
    for (let index = 0; index < 4; index += 1) {
      const forward = side === 0 || side === 1
      const t = forward ? -a + index * step : a - index * step
      const rotation = side * 90
      const cx = side === 1 ? b : side === 3 ? -b : t
      const cy = side === 0 ? -b : side === 2 ? b : t
      border.push({
        regionId: `border-${side * 4 + index}`,
        layer: 'border',
        cx,
        cy,
        rotation,
        length: borderLength,
        width: borderWidth,
      })
    }
  }

  const cornerHoles: FlowerGeometry['cornerHoles'] = []

  return {
    petals,
    puffs,
    clusters,
    border,
    centerHole: { radius: 0.16 },
    cornerHoles,
    viewBox: FLOWER_VIEW_BOX,
  }
}
