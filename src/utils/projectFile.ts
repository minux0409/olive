import type { ProjectFile, ProjectFileV1, Slide } from '../types/project'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export function generateUUID(): string {
  return crypto.randomUUID()
}

export function createSlide(name: string, elements: readonly ExcalidrawElement[], appState?: Partial<AppState>, files?: BinaryFiles): Slide {
  const now = new Date().toISOString()
  return {
    id: generateUUID(),
    name,
    elements,
    appState: { ...(appState ?? {}), collaborators: undefined },
    files: files ?? {},
    createdAt: now,
    updatedAt: now,
  }
}

export function makeProjectFile(projectName: string, slides: Slide[]): ProjectFile {
  const now = new Date().toISOString()
  return {
    formatVersion: 2,
    projectName,
    createdAt: now,
    updatedAt: now,
    slides,
  }
}

// Guards against corrupted/partial slide data (e.g. from a previous broken save)
function sanitizeSlide(value: unknown): Slide {
  const candidate = (value ?? {}) as Partial<Slide>
  return {
    id: typeof candidate.id === 'string' ? candidate.id : generateUUID(),
    name: typeof candidate.name === 'string' ? candidate.name : 'Slide',
    elements: Array.isArray(candidate.elements) ? candidate.elements : [],
    appState: candidate.appState ?? {},
    files: candidate.files ?? {},
    createdAt: candidate.createdAt ?? new Date().toISOString(),
    updatedAt: candidate.updatedAt ?? new Date().toISOString(),
  }
}

export function parseProjectFile(value: unknown): ProjectFile {
  if (!value || typeof value !== 'object') throw new Error('파일 형식이 올바르지 않습니다.')
  const candidate = value as Partial<ProjectFile> & Partial<ProjectFileV1>

  // Handle new format (v2), including server documents saved without an explicit formatVersion
  if (candidate.formatVersion === 2 || (Array.isArray(candidate.slides) && !('elements' in candidate))) {
    if (!Array.isArray(candidate.slides)) throw new Error('Wireframe Studio 파일이 아닙니다.')
    const slides = candidate.slides.map(sanitizeSlide)
    return {
      formatVersion: 2,
      projectName: typeof candidate.projectName === 'string' ? candidate.projectName : '내 와이어프레임',
      createdAt: candidate.createdAt ?? new Date().toISOString(),
      updatedAt: candidate.updatedAt ?? new Date().toISOString(),
      slides: slides.length ? slides : [createSlide('Slide 1', [], {}, {})],
    }
  }

  // Handle legacy format (v1) - migrate to v2
  if (candidate.formatVersion === 1 || !('formatVersion' in candidate)) {
    if (!Array.isArray(candidate.elements) || typeof candidate.projectName !== 'string') {
      throw new Error('Wireframe Studio 파일이 아닙니다.')
    }
    const migratedSlide = createSlide(
      'Slide 1',
      candidate.elements,
      candidate.appState ?? {},
      candidate.files ?? {}
    )
    return {
      formatVersion: 2,
      projectName: candidate.projectName,
      createdAt: candidate.createdAt ?? new Date().toISOString(),
      updatedAt: candidate.updatedAt ?? new Date().toISOString(),
      slides: [migratedSlide],
    }
  }

  throw new Error('지원하지 않는 파일 버전입니다.')
}
