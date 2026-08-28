import { useState } from 'react'
import { Excalidraw } from '@excalidraw/excalidraw'
import type { Slide } from '../types/project'

export function GuestCanvas({ name, slides }: { name: string; slides: Slide[] }) {
  const [activeId, setActiveId] = useState(slides[0].id)
  const active = slides.find((slide) => slide.id === activeId) ?? slides[0]

  return (
    <div className="guest-page">
      <header className="guest-header">
        <div className="brand"><span className="brand-mark">W</span><span>Wireframe Studio</span></div>
        <span className="guest-badge">게스트 보기 · 읽기 전용</span>
        <strong>{name}</strong>
      </header>
      <div className="guest-body">
        <nav className="guest-slide-list">
          {slides.map((slide, index) => (
            <button key={slide.id} className={`guest-slide-item ${slide.id === activeId ? 'active' : ''}`} onClick={() => setActiveId(slide.id)}>
              <span className="guest-slide-number">{index + 1}</span>
              <span className="guest-slide-name">{slide.name}</span>
            </button>
          ))}
        </nav>
        <main className="guest-canvas">
          <Excalidraw key={active.id} viewModeEnabled initialData={{ elements: active.elements, appState: { ...active.appState, collaborators: new Map() }, files: active.files }} />
        </main>
      </div>
    </div>
  )
}
