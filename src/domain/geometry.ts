import type { LayerId } from './types'

export const FLOWER_VIEW_SIZE = 9.2
export const FLOWER_HALF = FLOWER_VIEW_SIZE / 2
export const FLOWER_VIEW_BOX = `${-FLOWER_HALF} ${-FLOWER_HALF} ${FLOWER_VIEW_SIZE} ${FLOWER_VIEW_SIZE}`

/**
 * The reference svg draws the square in a 252 × 252 box with clusters whose
 * 3-dc unit is about 34 units tall including the top chain. 268 units covers
 * the full square including those tips, so this maps it into the 9.2 tile.
 */
export const FLOWER_SCALE = FLOWER_VIEW_SIZE / 268

export interface ClusterPiece {
  regionId: string
  layer: LayerId
  cx: number
  cy: number
  rotation: number
  scale: number
}

export interface FlowerGeometry {
  center: ClusterPiece[]
  inner: ClusterPiece[]
  outer: ClusterPiece[]
  border: ClusterPiece[]
  outline: {
    x: number
    y: number
    size: number
    rx: number
    strokeWidth: number
  }
  viewBox: string
}

function cluster(
  regionId: string,
  layer: LayerId,
  x: number,
  y: number,
  rotation: number,
  scale: number,
): ClusterPiece {
  return {
    regionId,
    layer,
    cx: x * FLOWER_SCALE,
    cy: y * FLOWER_SCALE,
    rotation,
    scale: FLOWER_SCALE * scale,
  }
}

export function flowerGeometry(): FlowerGeometry {
  const center = Array.from({ length: 6 }, (_, index) => {
    const angle = -90 + index * 60
    const rad = (angle * Math.PI) / 180
    return cluster(
      `petal-${index}`,
      'center',
      Math.cos(rad) * 8,
      Math.sin(rad) * 8,
      angle + 90,
      0.95,
    )
  })

  const inner = [
    cluster('puff-0', 'puff', -23, -23, -22, 1.05),
    cluster('puff-1', 'puff', -23, -23, -68, 1.05),
    cluster('puff-2', 'puff', 23, -23, 22, 1.05),
    cluster('puff-3', 'puff', 23, -23, 68, 1.05),
    cluster('puff-4', 'puff', 23, 23, 158, 1.05),
    cluster('puff-5', 'puff', 23, 23, 112, 1.05),
    cluster('puff-6', 'puff', -23, 23, -158, 1.05),
    cluster('puff-7', 'puff', -23, 23, -112, 1.05),
  ]

  const outer = [
    cluster('bg-0', 'background', -56, -56, -20, 1.12),
    cluster('bg-1', 'background', 0, -56, 0, 1.12),
    cluster('bg-2', 'background', 56, -56, 20, 1.12),
    cluster('bg-3', 'background', 56, -56, 70, 1.12),
    cluster('bg-4', 'background', 56, 0, 90, 1.12),
    cluster('bg-5', 'background', 56, 56, 110, 1.12),
    cluster('bg-6', 'background', 56, 56, 160, 1.12),
    cluster('bg-7', 'background', 0, 56, 180, 1.12),
    cluster('bg-8', 'background', -56, 56, 200, 1.12),
    cluster('bg-9', 'background', -56, 56, 250, 1.12),
    cluster('bg-10', 'background', -56, 0, 270, 1.12),
    cluster('bg-11', 'background', -56, -56, 290, 1.12),
  ]

  const border = [
    cluster('border-0', 'border', -92, -92, -18, 1.22),
    cluster('border-1', 'border', -32, -92, 2, 1.2),
    cluster('border-2', 'border', 32, -92, -2, 1.2),
    cluster('border-3', 'border', 92, -92, 18, 1.22),
    cluster('border-4', 'border', 92, -92, 72, 1.22),
    cluster('border-5', 'border', 92, -32, 88, 1.2),
    cluster('border-6', 'border', 92, 32, 92, 1.2),
    cluster('border-7', 'border', 92, 92, 108, 1.22),
    cluster('border-8', 'border', 92, 92, 162, 1.22),
    cluster('border-9', 'border', 32, 92, 178, 1.2),
    cluster('border-10', 'border', -32, 92, 182, 1.2),
    cluster('border-11', 'border', -92, 92, 198, 1.22),
    cluster('border-12', 'border', -92, 92, 252, 1.22),
    cluster('border-13', 'border', -92, 32, 268, 1.2),
    cluster('border-14', 'border', -92, -32, 272, 1.2),
    cluster('border-15', 'border', -92, -92, 288, 1.22),
  ]

  const outlineHalf = 126 * FLOWER_SCALE
  const outlineSize = outlineHalf * 2

  return {
    center,
    inner,
    outer,
    border,
    outline: {
      x: -outlineHalf,
      y: -outlineHalf,
      size: outlineSize,
      rx: 22 * FLOWER_SCALE,
      strokeWidth: 7 * FLOWER_SCALE,
    },
    viewBox: FLOWER_VIEW_BOX,
  }
}
