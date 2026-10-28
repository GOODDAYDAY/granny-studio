import { ExternalLink, Eye, LayoutGrid, Paintbrush } from 'lucide-react'
import { useStudio } from '../store/studio'
import Logo from './Logo'

const SAVE_LABEL = {
  saved: '已保存',
  saving: '保存中…',
  error: '保存失败',
} as const

export default function Header() {
  const mode = useStudio((state) => state.mode)
  const setMode = useStudio((state) => state.setMode)
  const saveState = useStudio((state) => state.saveState)
  const openView = useStudio((state) => state.openView)

  return (
    <header className="app-header">
      <div className="brand">
        <Logo />
        <div className="brand-text">
          <h1>织色间</h1>
          <span>GRANNY STUDIO</span>
        </div>
      </div>

      <nav className="mode-tabs" aria-label="工作模式">
        <button
          type="button"
          className={`mode-tab${mode === 'square' ? ' is-active' : ''}`}
          onClick={() => setMode('square')}
          aria-pressed={mode === 'square'}
        >
          <Paintbrush size={16} />
          方格
        </button>
        <button
          type="button"
          className={`mode-tab${mode === 'board' ? ' is-active' : ''}`}
          onClick={() => setMode('board')}
          aria-pressed={mode === 'board'}
        >
          <LayoutGrid size={16} />
          拼毯
        </button>
      </nav>

      <div className="header-actions">
        <span className={`save-pill save-${saveState}`} aria-live="polite">
          <i />
          {SAVE_LABEL[saveState]}
        </span>
        <a
          className="icon-btn"
          href="https://github.com/GOODDAYDAY/granny-studio"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub 仓库"
          title="GitHub 仓库"
        >
          <ExternalLink size={18} />
        </a>
        <button type="button" className="btn btn-primary look-btn" onClick={openView}>
          <Eye size={16} />
          看看
        </button>
      </div>
    </header>
  )
}
