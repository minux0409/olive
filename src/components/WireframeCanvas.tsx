import { useEffect, useRef } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

interface Props { onMount: (api: ExcalidrawImperativeAPI) => void; onChange: (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => void; onDropControl: (type: string, x: number, y: number) => void; onAddAtCenter: () => void; empty: boolean }
export function WireframeCanvas({ onMount, onChange, onDropControl, onAddAtCenter, empty }: Props) {
  const containerRef = useRef<HTMLElement | null>(null)
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)

  // Excalidraw caches the canvas container's screen offset; re-sync it whenever
  // the container's real size/position settles (sidebar toggles, window resize, initial layout).
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => apiRef.current?.refresh())
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  return <main ref={containerRef} className="canvas-shell" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const type = event.dataTransfer.getData('application/wireframe-control'); if (!type) return; const rect = event.currentTarget.getBoundingClientRect(); onDropControl(type, event.clientX - rect.left, event.clientY - rect.top) }}><Excalidraw excalidrawAPI={(api) => { apiRef.current = api; onMount(api) }} onChange={onChange} initialData={{ appState: { viewBackgroundColor: '#f6f7f8' } }} UIOptions={{ canvasActions: { changeViewBackgroundColor: false, clearCanvas: false, export: false, loadScene: false, saveToActiveFile: false, saveAsImage: false } }} langCode="ko" /><div className={`empty-state ${empty ? '' : 'hidden'}`} onClick={onAddAtCenter}><span className="empty-icon">+</span><strong>왼쪽에서 컨트롤을 끌어와 화면을 만들어보세요.</strong><small>또는 컨트롤을 클릭해 중앙에 추가</small></div></main>
}
