import { useStudio } from '../store/studio'

export default function ConfirmDialog() {
  const confirm = useStudio((state) => state.confirm)
  const closeConfirm = useStudio((state) => state.closeConfirm)

  if (!confirm) return null

  return (
    <div className="modal-backdrop confirm-backdrop" onPointerDown={closeConfirm}>
      <div
        className="confirm-card"
        role="dialog"
        aria-modal="true"
        aria-label={confirm.title}
        onPointerDown={(event) => event.stopPropagation()}
      >
        <span className="eyebrow">CONFIRM</span>
        <h2>{confirm.title}</h2>
        <p>{confirm.body}</p>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeConfirm}>
            取消
          </button>
          <button
            type="button"
            className={`btn ${confirm.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={() => {
              confirm.onConfirm()
              closeConfirm()
            }}
          >
            {confirm.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
