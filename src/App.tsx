import { useEffect } from 'react'
import BoardStage from './components/BoardStage'
import ConfirmDialog from './components/ConfirmDialog'
import DesignLibrary from './components/DesignLibrary'
import Header from './components/Header'
import ImagePicker from './components/ImagePicker'
import LayerPanel from './components/LayerPanel'
import LayoutPanel from './components/LayoutPanel'
import PalettePanel from './components/PalettePanel'
import SquareEditor from './components/SquareEditor'
import ViewMode from './components/ViewMode'
import { saveProject } from './store/persist'
import { useStudio } from './store/studio'

export default function App() {
  const mode = useStudio((state) => state.mode)
  const viewMode = useStudio((state) => state.viewMode)
  const imagePickerOpen = useStudio((state) => state.imagePickerOpen)
  const confirm = useStudio((state) => state.confirm)
  const project = useStudio((state) => state.project)
  const setSaveState = useStudio((state) => state.setSaveState)
  const undo = useStudio((state) => state.undo)
  const redo = useStudio((state) => state.redo)
  const closeImagePicker = useStudio((state) => state.closeImagePicker)
  const closeView = useStudio((state) => state.closeView)
  const closeConfirm = useStudio((state) => state.closeConfirm)

  useEffect(() => {
    setSaveState('saving')
    const timer = window.setTimeout(() => {
      try {
        saveProject(project)
        setSaveState('saved')
      } catch {
        setSaveState('error')
      }
    }, 350)
    return () => window.clearTimeout(timer)
  }, [project, setSaveState])

  useEffect(() => {
    const flush = () => {
      try {
        saveProject(useStudio.getState().project)
      } catch {
        // ignore storage failures on unload
      }
    }
    window.addEventListener('pagehide', flush)
    return () => window.removeEventListener('pagehide', flush)
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const typing =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable === true

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z' && !typing) {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }

      if (event.key === 'Escape') {
        if (useStudio.getState().confirm) {
          closeConfirm()
        } else if (useStudio.getState().imagePickerOpen) {
          closeImagePicker()
        } else if (useStudio.getState().viewMode) {
          closeView()
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [undo, redo, closeConfirm, closeImagePicker, closeView])

  if (viewMode) return <ViewMode />

  return (
    <div className="app">
      <Header />
      <main className="workspace">
        <aside className="panel left-panel" aria-label="方格库">
          <DesignLibrary />
        </aside>
        <section className="stage" aria-label={mode === 'square' ? '方格编辑' : '拼毯布局'}>
          {mode === 'square' ? <SquareEditor /> : <BoardStage />}
        </section>
        <aside className="panel right-panel" aria-label={mode === 'square' ? '调色与分层' : '布局设置'}>
          {mode === 'square' ? (
            <>
              <PalettePanel />
              <LayerPanel />
            </>
          ) : (
            <LayoutPanel />
          )}
        </aside>
      </main>

      {imagePickerOpen && <ImagePicker />}
      {confirm && <ConfirmDialog />}
    </div>
  )
}
