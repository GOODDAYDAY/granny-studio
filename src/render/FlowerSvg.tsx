import { useMemo } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { adjustLightness } from '../domain/color'
import { flowerGeometry } from '../domain/geometry'
import type { ClusterPiece, FlowerGeometry } from '../domain/geometry'
import type { LayerId, SquareDesign } from '../domain/types'

export function uniqueDesignColors(design: SquareDesign): string[] {
  return Array.from(new Set(Object.values(design.colors)))
}

export function ColorDefs({ design, prefix }: { design: SquareDesign; prefix: string }) {
  const colors = uniqueDesignColors(design)
  return (
    <>
      {colors.map((hex, index) => (
        <linearGradient
          id={`${prefix}-g-${index}`}
          key={`${prefix}-${hex}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={adjustLightness(hex, 9)} />
          <stop offset="52%" stopColor={hex} />
          <stop offset="100%" stopColor={adjustLightness(hex, -13)} />
        </linearGradient>
      ))}
      <filter id={`${prefix}-fuzz`} x="-18%" y="-18%" width="136%" height="136%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency=".72"
          numOctaves="2"
          seed="11"
          result="noise"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="noise"
          scale=".04"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur stdDeviation=".003" />
      </filter>
      <filter id={`${prefix}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence
          type="fractalNoise"
          baseFrequency=".9"
          numOctaves="3"
          seed="5"
          result="grain"
        />
        <feColorMatrix in="grain" type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="linear" slope=".55" />
        </feComponentTransfer>
      </filter>
    </>
  )
}

const LEFT_DC =
  'M -2,2 C -8,-6 -16,-19 -14,-27 C -12,-33 -4,-31 -3,-24 C -2,-15 0,-5 -2,2 Z'
const RIGHT_DC =
  'M 2,2 C 8,-6 16,-19 14,-27 C 12,-33 4,-31 3,-24 C 2,-15 0,-5 2,2 Z'
const MIDDLE_DC =
  'M 0,3 C -5,-6 -6,-21 -5,-28 C -3,-34 3,-34 5,-28 C 6,-21 5,-6 0,3 Z'

function DcCluster({ fill, detail }: { fill: string; detail: boolean }) {
  return (
    <g>
      <g
        fill="rgba(30,19,8,.20)"
        transform="translate(1.2 2.2)"
        pointerEvents="none"
      >
        <path d={LEFT_DC} />
        <path d={RIGHT_DC} />
        <path d={MIDDLE_DC} />
      </g>
      <g
        fill={fill}
        stroke="none"
        strokeLinejoin="round"
      >
        <path className="base" d={LEFT_DC} />
        <path className="base" d={RIGHT_DC} />
        <path className="base" d={MIDDLE_DC} />
      </g>
      {detail && (
        <>
          <g
            stroke="rgba(0,0,0,.19)"
            strokeWidth={1.2}
            fill="none"
            strokeLinecap="round"
            pointerEvents="none"
          >
            <path d="M -2,0 C -8,-8 -14,-19 -13,-26" />
            <path d="M -5,-9 C -9,-13 -12,-18 -11,-23" />
            <path d="M -3,-16 C -6,-20 -8,-24 -7,-28" />
            <path d="M 2,0 C 8,-8 14,-19 13,-26" />
            <path d="M 5,-9 C 9,-13 12,-18 11,-23" />
            <path d="M 3,-16 C 6,-20 8,-24 7,-28" />
            <path d="M -3,-4 C -4,-13 -4,-22 -3,-28" />
            <path d="M 3,-4 C 4,-13 4,-22 3,-28" />
            <path d="M -4,-12 C -1,-16 2,-16 4,-12" />
            <path d="M -4,-20 C -1,-24 2,-24 4,-20" />
          </g>
          <g
            stroke="rgba(255,255,255,.23)"
            strokeWidth={1.1}
            fill="none"
            strokeLinecap="round"
            pointerEvents="none"
          >
            <path d="M -9,-14 C -11,-19 -11,-24 -9,-28" />
            <path d="M 0,-8 C -1,-16 -1,-23 0,-29" />
            <path d="M 9,-14 C 11,-19 11,-24 9,-28" />
          </g>
          <path
            d="M -16,-28 Q -11,-34 -5,-29 Q 0,-35 5,-29 Q 11,-34 16,-28"
            fill="none"
            stroke="rgba(0,0,0,.17)"
            strokeWidth={2.1}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d="M -15,-29 Q -10,-34 -5,-30 Q 0,-35 5,-30 Q 10,-34 15,-29"
            fill="none"
            stroke="rgba(255,255,255,.26)"
            strokeWidth={1.1}
            strokeLinecap="round"
            pointerEvents="none"
          />
        </>
      )}
    </g>
  )
}

interface RegionShellProps {
  id: string
  layer: LayerId
  children: ReactNode
}

function RegionShell({ id, layer, children }: RegionShellProps) {
  return (
    <g className="flower-region" data-region={id} data-layer={layer}>
      {children}
    </g>
  )
}

function clusterElement(
  piece: ClusterPiece,
  fill: string,
  detail: boolean,
) {
  return (
    <RegionShell
      key={piece.regionId}
      id={piece.regionId}
      layer={piece.layer}
    >
      <g
        transform={`translate(${piece.cx} ${piece.cy}) rotate(${piece.rotation}) scale(${piece.scale})`}
      >
        <DcCluster fill={fill} detail={detail} />
      </g>
    </RegionShell>
  )
}

export interface FlowerShapesProps {
  design: SquareDesign
  prefix: string
  detail?: boolean
}

export function FlowerShapes({
  design,
  prefix,
  detail = true,
}: FlowerShapesProps) {
  const geometry = useMemo(() => flowerGeometry(), [])
  const colors = useMemo(() => uniqueDesignColors(design), [design])
  const colorIndex = useMemo(
    () => new Map(colors.map((hex, index) => [hex, index])),
    [colors],
  )
  const fillFor = (hex: string) => `url(#${prefix}-g-${colorIndex.get(hex) ?? 0})`
  const borderColor = design.colors['border-0'] ?? colors[0]

  return (
    <g
      className="flower-root"
      filter={detail ? `url(#${prefix}-fuzz)` : undefined}
    >
      <g data-layer="border" className="cluster-outline">
        <rect
          x={geometry.outline.x}
          y={geometry.outline.y}
          width={geometry.outline.size}
          height={geometry.outline.size}
          rx={geometry.outline.rx}
          fill="none"
          stroke={fillFor(borderColor)}
          strokeWidth={geometry.outline.strokeWidth}
          pointerEvents="stroke"
        />
      </g>

      {geometry.border.map((piece) =>
        clusterElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          detail,
        ),
      )}

      {geometry.outer.map((piece) =>
        clusterElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          detail,
        ),
      )}

      {geometry.inner.map((piece) =>
        clusterElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          detail,
        ),
      )}

      {geometry.center.map((piece) =>
        clusterElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          detail,
        ),
      )}

      {detail && (
        <rect
          x={-4.6}
          y={-4.6}
          width={9.2}
          height={9.2}
          filter={`url(#${prefix}-grain)`}
          opacity=".06"
          style={{ mixBlendMode: 'overlay' }}
          pointerEvents="none"
        />
      )}
    </g>
  )
}

export interface FlowerSvgProps {
  design: SquareDesign
  prefix: string
  className?: string
  interactive?: boolean
  onFillLayer?: (layer: LayerId) => void
}

export default function FlowerSvg({
  design,
  prefix,
  className,
  interactive = false,
  onFillLayer,
}: FlowerSvgProps) {
  const geometry = useMemo(() => flowerGeometry(), [])

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    const target = event.target as Element | null
    const region = target?.closest('[data-layer]')
    const layer = region?.getAttribute('data-layer') as LayerId | null
    if (layer) onFillLayer?.(layer)
  }

  return (
    <svg
      viewBox={geometry.viewBox}
      className={['flower-svg', interactive ? 'is-interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? '点任意一簇，把整圈填成当前色' : '祖母方格'}
      onPointerDown={handlePointerDown}
    >
      <defs>
        <ColorDefs design={design} prefix={prefix} />
      </defs>
      <FlowerShapes design={design} prefix={prefix} />
    </svg>
  )
}

export type { FlowerGeometry }
