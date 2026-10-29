import { create } from 'zustand'
import {
  assignCell as assignBoardCell,
  clearBoard as clearBoardCells,
  clearCell as clearBoardCell,
  clampDim,
  cycleDesigns,
  fillBoard as fillBoardCells,
  MAX_BOARD_CELLS,
  resizeBoard,
  rotateCell as rotateBoardCell,
} from '../domain/board'
import { describeColor, normalizeHex } from '../domain/color'
import {
  createDesign as createDesignEntity,
  duplicateDesign as duplicateDesignEntity,
  fillLayer as fillLayerColors,
  getLayerColors,
  makeId,
  renameDesign as renameDesignEntity,
  rotateLayerColors,
  setGapColor as setGapColorEntity,
  setPuffPlacement as setPuffPlacementEntity,
  setRegionColor,
  shuffleLayerColors,
} from '../domain/design'
import { createDemoProject } from '../domain/presets'
import type {
  GapLayer,
  Hex,
  LayerId,
  Mode,
  PaletteColor,
  Project,
  PuffPlacement,
  SquareDesign,
} from '../domain/types'
import { loadProject } from './persist'

const MAX_HISTORY = 60

export type SaveState = 'saved' | 'saving' | 'error'
export type BoardTool = 'stamp' | 'select' | 'clear'

export interface ConfirmRequest {
  title: string
  body: string
  confirmLabel: string
  tone?: 'danger' | 'normal'
  onConfirm: () => void
}

const initialProject = loadProject()
const initialDesign = initialProject.designs[0]
const initialColor = initialProject.palette[0]?.hex ?? '#B85C42'

interface StudioState {
  project: Project
  past: Project[]
  future: Project[]
  mode: Mode
  activeDesignId: string
  activeColor: Hex
  activeLayer: LayerId
  selectedCell: string | null
  boardTool: BoardTool
  imagePickerOpen: boolean
  viewMode: boolean
  saveState: SaveState
  confirm: ConfirmRequest | null

  setMode: (mode: Mode) => void
  setSaveState: (state: SaveState) => void
  undo: () => void
  redo: () => void

  selectDesign: (id: string) => void
  addDesign: () => void
  duplicateDesign: (id: string) => void
  duplicateDesignForCell: (row: number, col: number) => void
  deleteDesign: (id: string) => void
  renameDesign: (id: string, name: string) => void
  setPuffPlacement: (placement: PuffPlacement) => void
  setGapColor: (layer: GapLayer) => void

  selectColor: (hex: Hex) => void
  addPaletteColor: (hex: Hex, source?: PaletteColor['source']) => void
  selectLayer: (layer: LayerId) => void
  fillLayer: (layer: LayerId) => void
  fillActiveLayer: () => void
  paintRegion: (regionId: string) => void
  rotateColors: () => void
  shuffleColors: () => void

  setBoardSize: (rows: number, cols: number) => void
  setGap: (gap: number) => void
  setBoardTool: (tool: BoardTool) => void
  selectCell: (row: number, col: number) => void
  assignCell: (row: number, col: number) => void
  clearCell: (row: number, col: number) => void
  rotateCell: (row: number, col: number) => void
  fillBoard: () => void
  cycleBoard: () => void
  clearBoard: () => void

  openImagePicker: () => void
  closeImagePicker: () => void
  openView: () => void
  closeView: () => void
  requestConfirm: (request: ConfirmRequest) => void
  closeConfirm: () => void
  resetDemo: () => void
}

export const useStudio = create<StudioState>()((set, get) => {
  const activeDesign = (): SquareDesign | undefined => {
    const { project, activeDesignId } = get()
    return project.designs.find((design) => design.id === activeDesignId) ?? project.designs[0]
  }

  const commit = (recipe: (draft: Project) => void) => {
    const current = get().project
    const draft = structuredClone(current)
    recipe(draft)
    set({
      project: draft,
      past: [...get().past, current].slice(-MAX_HISTORY),
      future: [],
      saveState: 'saving',
    })
  }

  const commitNoHistory = (recipe: (draft: Project) => void) => {
    const draft = structuredClone(get().project)
    recipe(draft)
    set({ project: draft, saveState: 'saving' })
  }

  const replaceActiveDesign = (next: SquareDesign) => {
    if (next === activeDesign()) return
    commit((draft) => {
      const index = draft.designs.findIndex((design) => design.id === next.id)
      if (index >= 0) draft.designs[index] = next
    })
  }

  return {
    project: initialProject,
    past: [],
    future: [],
    mode: 'square',
    activeDesignId: initialDesign?.id ?? '',
    activeColor: initialColor,
    activeLayer: 'puff',
    selectedCell: null,
    boardTool: 'stamp',
    imagePickerOpen: false,
    viewMode: false,
    saveState: 'saved',
    confirm: null,

    setMode: (mode) => set({ mode }),
    setSaveState: (saveState) => set({ saveState }),

    undo: () => {
      const { past, future, project, activeDesignId } = get()
      if (past.length === 0) return
      const previous = past[past.length - 1]
      const nextActive = previous.designs.some((design) => design.id === activeDesignId)
        ? activeDesignId
        : previous.designs[0]?.id ?? ''
      set({
        project: previous,
        past: past.slice(0, -1),
        future: [project, ...future].slice(0, MAX_HISTORY),
        activeDesignId: nextActive,
        saveState: 'saving',
      })
    },

    redo: () => {
      const { past, future, project, activeDesignId } = get()
      if (future.length === 0) return
      const next = future[0]
      const nextActive = next.designs.some((design) => design.id === activeDesignId)
        ? activeDesignId
        : next.designs[0]?.id ?? ''
      set({
        project: next,
        past: [...past, project].slice(-MAX_HISTORY),
        future: future.slice(1),
        activeDesignId: nextActive,
        saveState: 'saving',
      })
    },

    selectDesign: (id) => {
      if (get().project.designs.some((design) => design.id === id)) {
        set({ activeDesignId: id })
      }
    },

    addDesign: () => {
      const source = activeDesign()
      const palette = get().project.palette
      const baseColors = source
        ? getLayerColors(source)
        : [0, 1, 2, 3].map((index) => palette[index % palette.length]?.hex ?? '#CCCCCC')
      const design = createDesignEntity({
        name: `新方格 ${get().project.designs.length + 1}`,
        colors: {
          center: baseColors[1] ?? baseColors[0],
          puff: baseColors[2] ?? baseColors[0],
          background: baseColors[3] ?? baseColors[0],
          border: baseColors[0],
        },
        puffPlacement: source?.puffPlacement ?? 'outer',
        gaps: source?.gaps,
      })
      commit((draft) => {
        draft.designs.push(design)
      })
      set({ activeDesignId: design.id })
    },

    duplicateDesign: (id) => {
      const source = get().project.designs.find((design) => design.id === id)
      if (!source) return
      const copy = duplicateDesignEntity(source)
      commit((draft) => {
        draft.designs.push(copy)
      })
      set({ activeDesignId: copy.id })
    },

    duplicateDesignForCell: (row, col) => {
      const placement = get().project.board.cells[`${row}:${col}`]
      if (!placement) return
      const source = get().project.designs.find(
        (design) => design.id === placement.designId,
      )
      if (!source) return
      const copy = duplicateDesignEntity(source, `${source.name} · 单格`)
      commit((draft) => {
        draft.designs.push(copy)
        draft.board = assignBoardCell(
          draft.board,
          row,
          col,
          copy.id,
          placement.rotation,
        )
      })
      set({ activeDesignId: copy.id, mode: 'square' })
    },

    deleteDesign: (id) => {
      const { project, activeDesignId } = get()
      if (project.designs.length <= 1) return
      const index = project.designs.findIndex((design) => design.id === id)
      if (index < 0) return
      commit((draft) => {
        draft.designs = draft.designs.filter((design) => design.id !== id)
        for (const key of Object.keys(draft.board.cells)) {
          if (draft.board.cells[key].designId === id) delete draft.board.cells[key]
        }
      })
      if (activeDesignId === id) {
        const next = get().project.designs[Math.min(index, get().project.designs.length - 1)]
        set({ activeDesignId: next?.id ?? '' })
      }
    },

    renameDesign: (id, name) => {
      const source = get().project.designs.find((design) => design.id === id)
      if (!source) return
      const next = renameDesignEntity(source, name)
      if (next === source) return
      commit((draft) => {
        const index = draft.designs.findIndex((design) => design.id === id)
        if (index >= 0) draft.designs[index] = next
      })
    },

    setPuffPlacement: (placement) => {
      const source = activeDesign()
      if (!source) return
      replaceActiveDesign(setPuffPlacementEntity(source, placement))
    },

    setGapColor: (layer) => {
      const source = activeDesign()
      if (!source) return
      replaceActiveDesign(setGapColorEntity(source, layer, get().activeColor))
    },

    selectColor: (hex) => {
      const normalized = normalizeHex(hex)
      if (normalized) set({ activeColor: normalized })
    },

    addPaletteColor: (hex, source = 'custom') => {
      const normalized = normalizeHex(hex)
      if (!normalized) return
      const existing = get().project.palette.find((color) => color.hex === normalized)
      if (existing) {
        set({ activeColor: existing.hex })
        return
      }
      const color: PaletteColor = {
        id: makeId('color'),
        hex: normalized,
        name: describeColor(normalized),
        source,
      }
      commitNoHistory((draft) => {
        draft.palette.push(color)
      })
      set({ activeColor: normalized })
    },

    selectLayer: (layer) => set({ activeLayer: layer }),

    fillLayer: (layer) => {
      const source = activeDesign()
      if (!source) return
      const next = fillLayerColors(source, layer, get().activeColor)
      if (next !== source) replaceActiveDesign(next)
      set({ activeLayer: layer })
    },

    fillActiveLayer: () => {
      get().fillLayer(get().activeLayer)
    },

    paintRegion: (regionId) => {
      const source = activeDesign()
      if (!source) return
      const next = setRegionColor(source, regionId, get().activeColor)
      replaceActiveDesign(next)
    },

    rotateColors: () => {
      const source = activeDesign()
      if (!source) return
      const next = rotateLayerColors(source)
      replaceActiveDesign(next)
    },

    shuffleColors: () => {
      const source = activeDesign()
      if (!source) return
      const next = shuffleLayerColors(source)
      replaceActiveDesign(next)
    },

    setBoardSize: (rows, cols) => {
      const nextRows = clampDim(rows)
      let nextCols = clampDim(cols)
      if (nextRows * nextCols > MAX_BOARD_CELLS) {
        nextCols = Math.floor(MAX_BOARD_CELLS / nextRows)
      }
      const current = get().project.board
      if (nextRows === current.rows && nextCols === current.cols) return
      const fillId = get().activeDesignId
      const oldRows = current.rows
      const oldCols = current.cols
      commit((draft) => {
        const resized = resizeBoard(draft.board, nextRows, nextCols)
        const cells = { ...resized.cells }
        if (fillId) {
          for (let row = 0; row < nextRows; row += 1) {
            for (let col = 0; col < nextCols; col += 1) {
              const outsideOld = row >= oldRows || col >= oldCols
              if (outsideOld && !cells[`${row}:${col}`]) {
                cells[`${row}:${col}`] = { designId: fillId, rotation: 0 }
              }
            }
          }
        }
        draft.board = { ...resized, cells }
      })
      set({ selectedCell: null })
    },

    setGap: (gap) => {
      const next = Math.min(0.14, Math.max(0, gap))
      if (next === get().project.board.gap) return
      commit((draft) => {
        draft.board.gap = next
      })
    },

    setBoardTool: (boardTool) => set({ boardTool }),

    selectCell: (row, col) => set({ selectedCell: `${row}:${col}` }),

    assignCell: (row, col) => {
      const { project, activeDesignId, boardTool } = get()
      const key = `${row}:${col}`
      const existing = project.board.cells[key]
      if (boardTool === 'select') {
        set({ selectedCell: key })
        return
      }
      if (boardTool === 'clear') {
        if (!existing) {
          set({ selectedCell: key })
          return
        }
        commit((draft) => {
          draft.board = clearBoardCell(draft.board, row, col)
        })
        set({ selectedCell: key })
        return
      }
      if (!activeDesignId) return
      if (existing?.designId === activeDesignId) {
        set({ selectedCell: key })
        return
      }
      commit((draft) => {
        draft.board = assignBoardCell(draft.board, row, col, activeDesignId, 0)
      })
      set({ selectedCell: key })
    },

    clearCell: (row, col) => {
      const existing = get().project.board.cells[`${row}:${col}`]
      if (!existing) return
      commit((draft) => {
        draft.board = clearBoardCell(draft.board, row, col)
      })
    },

    rotateCell: (row, col) => {
      const existing = get().project.board.cells[`${row}:${col}`]
      if (!existing) return
      commit((draft) => {
        draft.board = rotateBoardCell(draft.board, row, col)
      })
    },

    fillBoard: () => {
      const id = get().activeDesignId
      if (!id) return
      commit((draft) => {
        draft.board = fillBoardCells(draft.board, id)
      })
    },

    cycleBoard: () => {
      const ids = get().project.designs.map((design) => design.id)
      if (ids.length === 0) return
      commit((draft) => {
        draft.board = cycleDesigns(draft.board, ids)
      })
    },

    clearBoard: () => {
      if (Object.keys(get().project.board.cells).length === 0) return
      commit((draft) => {
        draft.board = clearBoardCells(draft.board)
      })
      set({ selectedCell: null })
    },

    openImagePicker: () => set({ imagePickerOpen: true }),
    closeImagePicker: () => set({ imagePickerOpen: false }),
    openView: () => set({ viewMode: true }),
    closeView: () => set({ viewMode: false }),
    requestConfirm: (request) => set({ confirm: request }),
    closeConfirm: () => set({ confirm: null }),

    resetDemo: () => {
      const current = get().project
      const demo = createDemoProject()
      set({
        project: demo,
        past: [...get().past, current].slice(-MAX_HISTORY),
        future: [],
        activeDesignId: demo.designs[0]?.id ?? '',
        activeColor: demo.palette[0]?.hex ?? '#B85C42',
        activeLayer: 'puff',
        selectedCell: null,
        saveState: 'saving',
      })
    },
  }
})
