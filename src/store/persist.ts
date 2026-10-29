import { createDemoProject } from '../domain/presets'
import type { Project } from '../domain/types'

const STORAGE_KEY = 'granny-studio.project.v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isValidProject(value: unknown): value is Project {
  if (!isRecord(value)) return false
  if (value.schemaVersion !== 1) return false
  if (!Array.isArray(value.palette) || value.palette.length === 0) return false
  if (!Array.isArray(value.designs) || value.designs.length === 0) return false
  if (!isRecord(value.board)) return false

  const board = value.board
  if (typeof board.rows !== 'number' || typeof board.cols !== 'number') return false
  if (!Number.isFinite(board.rows) || !Number.isFinite(board.cols)) return false
  if (!isRecord(board.cells)) return false
  if (typeof board.fabric !== 'string' || typeof board.gap !== 'number') return false

  for (const design of value.designs) {
    if (!isRecord(design)) return false
    if (typeof design.id !== 'string' || typeof design.name !== 'string') return false
    if (typeof design.patternId !== 'string') return false
    if (!isRecord(design.colors)) return false
    if (design.puffPlacement !== 'inner' && design.puffPlacement !== 'outer') return false
  }

  return true
}

export function loadProject(): Project {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return createDemoProject()
    const parsed: unknown = JSON.parse(raw)
    if (isValidProject(parsed)) return parsed
    window.localStorage.removeItem(STORAGE_KEY)
    return createDemoProject()
  } catch {
    return createDemoProject()
  }
}

export function saveProject(project: Project): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project))
}

export function clearSavedProject(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore storage failures
  }
}
