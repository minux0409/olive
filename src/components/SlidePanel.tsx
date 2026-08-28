import { useState } from 'react'
import type { Slide } from '../types/project'
import './SlidePanel.css'

export interface SlidePanelProps {
  slides: Slide[]
  currentSlideId: string | undefined
  onSelectSlide: (slideId: string) => void
  onAddSlide: (name: string) => void
  onRenameSlide: (slideId: string, name: string) => void
  onDeleteSlide: (slideId: string) => void
}

export function SlidePanel({ slides, currentSlideId, onSelectSlide, onAddSlide, onRenameSlide, onDeleteSlide }: SlidePanelProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamingName, setRenamingName] = useState('')
  const [showNewSlideInput, setShowNewSlideInput] = useState(false)
  const [newSlideName, setNewSlideName] = useState('')

  const handleRenameStart = (slide: Slide) => {
    setRenamingId(slide.id)
    setRenamingName(slide.name)
  }

  const handleRenameSave = (slideId: string) => {
    if (renamingName.trim()) {
      onRenameSlide(slideId, renamingName.trim())
    }
    setRenamingId(null)
  }

  const handleAddSlide = () => {
    if (newSlideName.trim()) {
      onAddSlide(newSlideName.trim())
      setNewSlideName('')
      setShowNewSlideInput(false)
    }
  }

  return (
    <div className="slide-panel">
      <div className="slide-panel-header">
        <h3>슬라이드</h3>
        <button className="add-slide-btn" onClick={() => setShowNewSlideInput(true)} title="새 슬라이드 추가">
          +
        </button>
      </div>

      {showNewSlideInput && (
        <div className="new-slide-input">
          <input
            type="text"
            placeholder="슬라이드 이름 입력"
            value={newSlideName}
            onChange={(e) => setNewSlideName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSlide()
              if (e.key === 'Escape') setShowNewSlideInput(false)
            }}
            autoFocus
          />
          <button onClick={handleAddSlide}>추가</button>
          <button onClick={() => setShowNewSlideInput(false)}>취소</button>
        </div>
      )}

      <div className="slide-list">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`slide-item ${currentSlideId === slide.id ? 'active' : ''}`}
            onClick={() => onSelectSlide(slide.id)}
          >
            <div className="slide-number">{index + 1}</div>
            {renamingId === slide.id ? (
              <input
                type="text"
                className="slide-rename-input"
                value={renamingName}
                onChange={(e) => setRenamingName(e.target.value)}
                onBlur={() => handleRenameSave(slide.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameSave(slide.id)
                  if (e.key === 'Escape') setRenamingId(null)
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <div className="slide-name" onDoubleClick={() => handleRenameStart(slide)}>
                {slide.name}
              </div>
            )}
            <button
              className="delete-slide-btn"
              onClick={(e) => {
                e.stopPropagation()
                if (window.confirm(`'${slide.name}' 슬라이드를 삭제하시겠어요?`)) {
                  onDeleteSlide(slide.id)
                }
              }}
              title="슬라이드 삭제"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
