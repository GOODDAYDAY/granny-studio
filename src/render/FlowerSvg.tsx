import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { adjustLightness } from '../domain/color'
import { flowerGeometry } from '../domain/geometry'
import type { FlowerGeometry, RadialPiece } from '../domain/geometry'
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
      <pattern
        id={`${prefix}-yarn`}
        width=".22"
        height=".22"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(26)"
      >
        <path
          d="M0 .035 Q .055 .005 .11 .035 T .22 .035"
          fill="none"
          stroke="#2A1A0F"
          strokeOpacity=".14"
          strokeWidth=".015"
        />
        <path
          d="M0 .09 Q .055 .06 .11 .09 T .22 .09"
          fill="none"
          stroke="#FFF8EC"
          strokeOpacity=".16"
          strokeWidth=".011"
        />
        <path
          d="M0 .14 Q .055 .11 .11 .14 T .22 .14"
          fill="none"
          stroke="#2A1A0F"
          strokeOpacity=".1"
          strokeWidth=".012"
        />
        <path
          d="M0 .19 Q .055 .16 .11 .19 T .22 .19"
          fill="none"
          stroke="#FFF8EC"
          strokeOpacity=".09"
          strokeWidth=".008"
        />
      </pattern>
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
          scale=".06"
          xChannelSelector="R"
          yChannelSelector="G"
        />
        <feGaussianBlur stdDeviation=".005" />
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

function puffPath(length: number, width: number): string {
  const h = length / 2
  const w = width / 2
  return [
    `M 0 ${-h}`,
    `C ${w * 0.65} ${-h * 0.98}, ${w * 0.98} ${-h * 0.55}, ${w * 0.98} 0`,
    `C ${w * 0.98} ${h * 0.55}, ${w * 0.62} ${h * 0.9}, 0 ${h}`,
    `C ${-w * 0.62} ${h * 0.9}, ${-w * 0.98} ${h * 0.55}, ${-w * 0.98} 0`,
    `C ${-w * 0.98} ${-h * 0.55}, ${-w * 0.65} ${-h * 0.98}, 0 ${-h}`,
    'Z',
  ].join(' ')
}

function clusterPath(length: number, width: number): string {
  const h = length / 2
  const w = width / 2
  return [
    `M 0 ${-h}`,
    `C ${w * 0.56} ${-h * 0.92}, ${w * 0.9} ${-h * 0.4}, ${w * 0.9} 0`,
    `C ${w * 0.9} ${h * 0.4}, ${w * 0.56} ${h * 0.92}, 0 ${h}`,
    `C ${-w * 0.56} ${h * 0.92}, ${-w * 0.9} ${h * 0.4}, ${-w * 0.9} 0`,
    `C ${-w * 0.9} ${-h * 0.4}, ${-w * 0.56} ${-h * 0.92}, 0 ${-h}`,
    'Z',
  ].join(' ')
}

function PuffShape({
  length,
  width,
  fill,
  texture,
  detail,
}: {
  length: number
  width: number
  fill: string
  texture: string
  detail: boolean
}) {
  const h = length / 2
  const w = width / 2
  const ridgeXs = [-w * 0.3, 0, w * 0.3]
  return (
    <>
      <path
        d={puffPath(length, width)}
        transform="translate(.035 .05)"
        fill="rgba(52,32,18,.15)"
        pointerEvents="none"
      />
      <path
        className="base"
        d={puffPath(length, width)}
        fill={fill}
        stroke="rgba(56,37,23,.2)"
        strokeWidth={0.018}
      />
      {detail && (
        <>
          <path
            d={puffPath(length, width)}
            fill={texture}
            pointerEvents="none"
          />
          <path
            d={puffPath(length, width)}
            transform={`translate(0 ${-length * 0.07}) scale(.59 .76)`}
            fill="rgba(255,255,255,.15)"
            pointerEvents="none"
          />
          {ridgeXs.map((x, index) => (
            <path
              key={`puff-ridge-${index}`}
              d={`M ${x} ${h * 0.74} C ${x + w * 0.075} ${h * 0.24}, ${x - w * 0.075} ${-h * 0.24}, ${x} ${-h * 0.74}`}
              fill="none"
              stroke="rgba(47,28,15,.2)"
              strokeWidth={0.021}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          {ridgeXs.map((x, index) => (
            <path
              key={`puff-ridge-light-${index}`}
              d={`M ${x + 0.02} ${h * 0.64} C ${x + w * 0.075 + 0.02} ${h * 0.18}, ${x - w * 0.075 + 0.02} ${-h * 0.18}, ${x + 0.02} ${-h * 0.64}`}
              fill="none"
              stroke="rgba(255,255,255,.18)"
              strokeWidth={0.011}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          <path
            d={`M ${-w * 0.7} ${h * 0.72} Q 0 ${h * 0.88} ${w * 0.7} ${h * 0.72}`}
            fill="none"
            stroke="rgba(47,28,15,.2)"
            strokeWidth={0.022}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d={`M ${-w * 0.58} ${-h * 0.22} Q 0 ${-h * 0.32} ${w * 0.58} ${-h * 0.22}`}
            fill="none"
            stroke="rgba(47,28,15,.09)"
            strokeWidth={0.014}
            pointerEvents="none"
          />
          <path
            d={`M ${-w * 0.6} ${h * 0.16} Q 0 ${h * 0.25} ${w * 0.6} ${h * 0.16}`}
            fill="none"
            stroke="rgba(47,28,15,.08)"
            strokeWidth={0.013}
            pointerEvents="none"
          />
        </>
      )}
    </>
  )
}

function ClusterShape({
  length,
  width,
  fill,
  texture,
  detail,
}: {
  length: number
  width: number
  fill: string
  texture: string
  detail: boolean
}) {
  const h = length / 2
  const w = width / 2
  const ridgeXs = [-w * 0.24, 0, w * 0.24]
  return (
    <>
      <path
        className="base"
        d={clusterPath(length, width)}
        fill={fill}
        stroke="rgba(56,37,23,.19)"
        strokeWidth={0.017}
      />
      {detail && (
        <>
          <path d={clusterPath(length, width)} fill={texture} pointerEvents="none" />
          {ridgeXs.map((x, index) => (
            <path
              key={`ridge-${index}`}
              d={`M ${x} ${h * 0.66} C ${x + w * 0.06} ${h * 0.15}, ${x - w * 0.06} ${-h * 0.15}, ${x} ${-h * 0.66}`}
              fill="none"
              stroke="rgba(47,28,15,.18)"
              strokeWidth={0.019}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          {ridgeXs.map((x, index) => (
            <path
              key={`ridge-light-${index}`}
              d={`M ${x + 0.018} ${h * 0.58} C ${x + w * 0.06 + 0.018} ${h * 0.12}, ${x - w * 0.06 + 0.018} ${-h * 0.12}, ${x + 0.018} ${-h * 0.58}`}
              fill="none"
              stroke="rgba(255,255,255,.13)"
              strokeWidth={0.011}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          <path
            d={`M ${-w * 0.62} ${h * 0.72} Q 0 ${h * 0.86} ${w * 0.62} ${h * 0.72}`}
            fill="none"
            stroke="rgba(47,28,15,.18)"
            strokeWidth={0.019}
            strokeLinecap="round"
            pointerEvents="none"
          />
        </>
      )}
    </>
  )
}

function BorderShape({
  length,
  width,
  fill,
  texture,
  detail,
}: {
  length: number
  width: number
  fill: string
  texture: string
  detail: boolean
}) {
  const ridgeYs = [-width * 0.22, 0, width * 0.22]
  const x1 = -length / 2 + width * 0.2
  const x2 = length / 2 - width * 0.2
  return (
    <>
      <rect
        className="base"
        x={-length / 2}
        y={-width / 2}
        width={length}
        height={width}
        rx={width / 2}
        fill={fill}
        stroke="rgba(56,37,23,.18)"
        strokeWidth={0.017}
      />
      {detail && (
        <>
          <rect
            x={-length / 2}
            y={-width / 2}
            width={length}
            height={width}
            rx={width / 2}
            fill={texture}
            pointerEvents="none"
          />
          {ridgeYs.map((y, index) => (
            <path
              key={`border-ridge-${index}`}
              d={`M ${x1} ${y} Q 0 ${y + 0.025} ${x2} ${y}`}
              fill="none"
              stroke="rgba(47,28,15,.18)"
              strokeWidth={0.018}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          {ridgeYs.map((y, index) => (
            <path
              key={`border-light-${index}`}
              d={`M ${x1 + 0.02} ${y + 0.022} Q 0 ${y + 0.047} ${x2 - 0.02} ${y + 0.022}`}
              fill="none"
              stroke="rgba(255,255,255,.14)"
              strokeWidth={0.01}
              strokeLinecap="round"
              pointerEvents="none"
            />
          ))}
          <path
            d={`M ${-length * 0.28} ${-width * 0.34} Q 0 ${-width * 0.42} ${length * 0.28} ${-width * 0.34}`}
            fill="none"
            stroke="rgba(255,255,255,.12)"
            strokeWidth={0.012}
            pointerEvents="none"
          />
          <path
            d={`M ${-length * 0.3} ${width * 0.34} Q 0 ${width * 0.42} ${length * 0.3} ${width * 0.34}`}
            fill="none"
            stroke="rgba(47,28,15,.16)"
            strokeWidth={0.016}
            strokeLinecap="round"
            pointerEvents="none"
          />
        </>
      )}
    </>
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

function radialElement(
  piece: RadialPiece,
  fill: string,
  texture: string,
  detail: boolean,
) {
  return (
    <RegionShell
      key={piece.regionId}
      id={piece.regionId}
      layer={piece.layer}
    >
      <g transform={`translate(${piece.cx} ${piece.cy}) rotate(${piece.rotation})`}>
        {piece.kind === 'cluster' ? (
          <ClusterShape
            length={piece.length}
            width={piece.width}
            fill={fill}
            texture={texture}
            detail={detail}
          />
        ) : (
          <PuffShape
            length={piece.length}
            width={piece.width}
            fill={fill}
            texture={texture}
            detail={detail}
          />
        )}
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
  const colorIndex = useMemo(() => new Map(colors.map((hex, index) => [hex, index])), [colors])
  const fillFor = (hex: string) => `url(#${prefix}-g-${colorIndex.get(hex) ?? 0})`
  const texture = `url(#${prefix}-yarn)`

  return (
    <g
      className="flower-root"
      filter={detail ? `url(#${prefix}-fuzz)` : undefined}
    >
      {geometry.clusters.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
        ),
      )}

      {geometry.puffs.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
        ),
      )}

      {geometry.petals.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
        ),
      )}

      {geometry.border.map((piece) => {
        const color = design.colors[piece.regionId] ?? colors[0]
        return (
          <RegionShell
            key={piece.regionId}
            id={piece.regionId}
            layer="border"
          >
            <g transform={`translate(${piece.cx} ${piece.cy}) rotate(${piece.rotation})`}>
              <BorderShape
                length={piece.length}
                width={piece.width}
                fill={fillFor(color)}
                texture={texture}
                detail={detail}
              />
            </g>
          </RegionShell>
        )
      })}

      {detail && (
        <rect
          x={-4.6}
          y={-4.6}
          width={9.2}
          height={9.2}
          filter={`url(#${prefix}-grain)`}
          opacity=".07"
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
}

export default function FlowerSvg({
  design,
  prefix,
  className,
}: FlowerSvgProps) {
  const geometry = useMemo(() => flowerGeometry(), [])

  return (
    <svg
      viewBox={geometry.viewBox}
      className={['flower-svg', className].filter(Boolean).join(' ')}
      role="img"
      aria-label="六瓣花方格"
    >
      <defs>
        <ColorDefs design={design} prefix={prefix} />
      </defs>
      <FlowerShapes design={design} prefix={prefix} />
    </svg>
  )
}

export type { FlowerGeometry }
