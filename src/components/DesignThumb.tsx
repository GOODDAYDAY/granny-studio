import type { SquareDesign } from '../domain/types'
import FlowerSvg from '../render/FlowerSvg'

export default function DesignThumb({
  design,
  prefix,
  className,
}: {
  design: SquareDesign
  prefix: string
  className?: string
}) {
  return (
    <div className={['design-thumb', className].filter(Boolean).join(' ')}>
      <FlowerSvg design={design} prefix={prefix} />
    </div>
  )
}
