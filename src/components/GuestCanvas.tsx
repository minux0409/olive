import { Excalidraw } from '@excalidraw/excalidraw'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'

export function GuestCanvas({ name, elements, appState, files }: { name: string; elements: readonly ExcalidrawElement[]; appState: Partial<AppState>; files: BinaryFiles }) {
  return <div className="guest-page"><header className="guest-header"><div className="brand"><span className="brand-mark">W</span><span>Wireframe Studio</span></div><span className="guest-badge">게스트 보기 · 읽기 전용</span><strong>{name}</strong></header><main className="guest-canvas"><Excalidraw viewModeEnabled initialData={{ elements, appState: { ...appState, collaborators: new Map() }, files }} /></main></div>
}
