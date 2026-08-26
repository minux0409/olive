import { exportToCanvas } from '@excalidraw/excalidraw'
import type { AppState, BinaryFiles } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'

export async function downloadPng(elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles, name: string) {
  if (!elements.length) throw new Error('빈 캔버스는 내보낼 수 없습니다.')
  const canvas = await exportToCanvas({ elements, appState, files, exportBackground: true, exportPadding: 32 })
  const link = document.createElement('a')
  link.download = `${name || 'wireframe'}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}
