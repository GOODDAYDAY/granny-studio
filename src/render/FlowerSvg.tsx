import { useMemo, useRef } from 'react'
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import { adjustLightness } from '../domain/color'
import { flowerGeometry } from '../domain/geometry'
import type { FlowerGeometry, RadialPiece } from '../domain/geometry'
import type { LayerId, SquareDesign } from '../domain/types'

const LAYER_LABELS: Record<LayerId, string> = {
  center: '花心',
  puff: '外瓣',
  background: '底针',
  border: '边框',
}

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
        width=".09"
        height=".09"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(28)"
      >
        <path d="M0 .02 H.09" stroke="#2A1A0F" strokeOpacity=".055" strokeWidth=".011" />
        <path d="M0 .058 H.09" stroke="#FFF8EC" strokeOpacity=".065" strokeWidth=".008" />
      </pattern>
      <radialGradient id={`${prefix}-hole`} cx="50%" cy="42%" r="62%">
        <stop offset="0%" stopColor="#3A2719" stopOpacity=".82" />
        <stop offset="62%" stopColor="#3A2719" stopOpacity=".46" />
        <stop offset="100%" stopColor="#3A2719" stopOpacity=".14" />
      </radialGradient>
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
          <path
            d={`M 0 ${h * 0.8} C ${w * 0.09} ${h * 0.25}, ${-w * 0.09} ${-h * 0.25}, 0 ${-h * 0.8}`}
            fill="none"
            stroke="rgba(47,28,15,.22)"
            strokeWidth={0.024}
            strokeLinecap="round"
            pointerEvents="none"
          />
          <path
            d={`M ${w * 0.035} ${h * 0.72} C ${w * 0.11} ${h * 0.2}, ${-w * 0.05} ${-h * 0.2}, ${w * 0.035} ${-h * 0.72}`}
            fill="none"
            stroke="rgba(255,255,255,.2)"
            strokeWidth={0.013}
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
        </>
      )}
    </>
  )
}

interface RegionShellProps {
  id: string
  layer: LayerId
  label: string
  interactive: boolean
  onPaint?: (regionId: string) => void
  children: ReactNode
}

function RegionShell({ id, layer, label, interactive, onPaint, children }: RegionShellProps) {
  return (
    <g
      className="flower-region"
      data-region={id}
      data-layer={layer}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? label : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onPaint?.(id)
              }
            }
          : undefined
      }
    >
      {interactive && <title>{label}</title>}
      {children}
    </g>
  )
}

function radialElement(
  piece: RadialPiece,
  fill: string,
  texture: string,
  detail: boolean,
  interactive: boolean,
  onPaint?: (regionId: string) => void,
) {
  const label = `${LAYER_LABELS[piece.layer]} ${Number(piece.regionId.split('-')[1]) + 1}`
  return (
    <RegionShell
      key={piece.regionId}
      id={piece.regionId}
      layer={piece.layer}
      label={label}
      interactive={interactive}
      onPaint={onPaint}
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
  interactive?: boolean
  onPaint?: (regionId: string) => void
}

export function FlowerShapes({
  design,
  prefix,
  detail = true,
  interactive = false,
  onPaint,
}: FlowerShapesProps) {
  const geometry = useMemo(() => flowerGeometry(design.puffPlacement), [design.puffPlacement])
  const colors = useMemo(() => uniqueDesignColors(design), [design])
  const colorIndex = useMemo(() => new Map(colors.map((hex, index) => [hex, index])), [colors])
  const fillFor = (hex: string) => `url(#${prefix}-g-${colorIndex.get(hex) ?? 0})`
  const texture = `url(#${prefix}-yarn)`

  return (
    <g className="flower-root">
      {geometry.border.map((piece) => {
        const color = design.colors[piece.regionId] ?? colors[0]
        return (
          <RegionShell
            key={piece.regionId}
            id={piece.regionId}
            layer="border"
            label={`边框 ${Number(piece.regionId.split('-')[1]) + 1}`}
            interactive={interactive}
            onPaint={onPaint}
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

      {geometry.clusters.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
          interactive,
          onPaint,
        ),
      )}

      {geometry.puffs.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
          interactive,
          onPaint,
        ),
      )}

      {geometry.petals.map((piece) =>
        radialElement(
          piece,
          fillFor(design.colors[piece.regionId] ?? colors[0]),
          texture,
          detail,
          interactive,
          onPaint,
        ),
      )}

      <circle
        cx={0}
        cy={0}
        r={geometry.centerHole.radius}
        fill={`url(#${prefix}-hole)`}
        pointerEvents="none"
      />
      {geometry.cornerHoles.map((hole, index) => (
        <circle
          key={`corner-${index}`}
          cx={hole.cx}
          cy={hole.cy}
          r={hole.radius}
          fill={`url(#${prefix}-hole)`}
          pointerEvents="none"
        />
      ))}
    </g>
  )
}

export interface FlowerSvgProps {
  design: SquareDesign
  prefix: string
  interactive?: boolean
  onPaint?: (regionId: string) => void
  className?: string
}

export default function FlowerSvg({
  design,
  prefix,
  interactive = false,
  onPaint,
  className,
}: FlowerSvgProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const painting = useRef(false)
  const geometry = useMemo(() => flowerGeometry(design.puffPlacement), [design.puffPlacement])

  const paintAtTarget = (target: Element | null) => {
    const region = target?.closest('[data-region]')
    const id = region?.getAttribute('data-region')
    if (id) onPaint?.(id)
  }

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive) return
    const target = event.target as Element | null
    const region = target?.closest('[data-region]')
    if (!region) return
    event.preventDefault()
    painting.current = true
    svgRef.current?.setPointerCapture(event.pointerId)
    paintAtTarget(target)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!interactive || !painting.current) return
    paintAtTarget(document.elementFromPoint(event.clientX, event.clientY))
  }

  const endStroke = (event: ReactPointerEvent<SVGSVGElement>) => {
    painting.current = false
    if (svgRef.current?.hasPointerCapture(event.pointerId)) {
      svgRef.current.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <svg
      ref={svgRef}
      viewBox={geometry.viewBox}
      className={['flower-svg', interactive ? 'is-interactive' : '', className]
        .filter(Boolean)
        .join(' ')}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endStroke}
      onPointerCancel={endStroke}
      role={interactive ? 'group' : 'img'}
      aria-label={interactive ? '六瓣花方格，点击任意花瓣上色' : '六瓣花方格'}
    >
      <defs>
        <ColorDefs design={design} prefix={prefix} />
      </defs>
      <FlowerShapes
        design={design}
        prefix={prefix}
        interactive={interactive}
        onPaint={onPaint}
      />
    </svg>
  )
}

export type { FlowerGeometry }
