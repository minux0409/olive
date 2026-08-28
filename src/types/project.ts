import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export interface Slide {
  id: string
  name: string
  elements: readonly ExcalidrawElement[]
  appState: Partial<AppState>
  files: BinaryFiles
  createdAt: string
  updatedAt: string
}

export interface ProjectFile {
  formatVersion: 2
  projectName: string
  createdAt: string
  updatedAt: string
  slides: Slide[]
}

// Legacy format for backward compatibility
export interface ProjectFileV1 {
  formatVersion: 1
  projectName: string
  createdAt: string
  updatedAt: string
  elements: readonly ExcalidrawElement[]
  appState: Partial<AppState>
  files: BinaryFiles
}
