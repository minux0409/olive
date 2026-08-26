import type { ProjectFile } from '../types/project'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export function makeProjectFile(projectName: string, elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles): ProjectFile {
  const now = new Date().toISOString()
  return { formatVersion: 1, projectName, createdAt: now, updatedAt: now, elements, appState: { ...appState, collaborators: undefined }, files }
}

export function parseProjectFile(value: unknown): ProjectFile {
  if (!value || typeof value !== 'object') throw new Error('파일 형식이 올바르지 않습니다.')
  const candidate = value as Partial<ProjectFile>
  if (candidate.formatVersion !== 1 || !Array.isArray(candidate.elements) || typeof candidate.projectName !== 'string') throw new Error('Wireframe Studio 파일이 아닙니다.')
  return { formatVersion: 1, projectName: candidate.projectName, createdAt: candidate.createdAt ?? new Date().toISOString(), updatedAt: candidate.updatedAt ?? new Date().toISOString(), elements: candidate.elements, appState: candidate.appState ?? {}, files: candidate.files ?? {} }
}
