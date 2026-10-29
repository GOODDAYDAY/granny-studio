import type { SquareDesign } from '../domain/types'
import FlowerSvg from '../render/FlowerSvg'

export default function DesignThumb({
  design,
  prefix,
  className,
  backing,
}: {
  design: SquareDesign
  prefix: string
  className?: string
  backing?: string | null
}) {
  return (
    <div className={['design-thumb', className].filter(Boolean).join(' ')}>
      <FlowerSvg design={design} prefix={prefix} backing={backing} />
    </div>
  )
}
