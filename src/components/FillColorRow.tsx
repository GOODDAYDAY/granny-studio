import { useStudio } from '../store/studio'

export default function FillColorRow() {
  const palette = useStudio((state) => state.project.palette)
  const fill = useStudio((state) => state.project.fill ?? null)
  const setFill = useStudio((state) => state.setFill)

  return (
    <div className="fill-block">
      <div className="sub-label">
        <span>整毯填缝</span>
        <span>接缝 + 默认</span>
      </div>
      <div className="fill-row">
        <button
          type="button"
          className={`fill-none${!fill ? ' is-active' : ''}`}
          onClick={() => setFill(null)}
          title="不填，露出底布"
        >
          无
        </button>
        {palette.map((color) => {
          const active = fill?.toUpperCase() === color.hex.toUpperCase()
          return (
            <button
              key={color.id}
              type="button"
              className={`fill-dot${active ? ' is-active' : ''}`}
              style={{ background: color.hex }}
              title={`${color.name} ${color.hex}`}
              aria-label={`整毯填缝色 ${color.name} ${color.hex}`}
              aria-pressed={active}
              onClick={() => setFill(color.hex)}
            />
          )
        })}
      </div>
      <p className="micro-hint">
        整毯默认 + 格子之间的接缝；拼毯里选中格子，可以单独改这一格。
      </p>
    </div>
  )
}
