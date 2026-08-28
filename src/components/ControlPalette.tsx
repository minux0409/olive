import { useMemo, useState } from 'react'
import type { ControlCategory, ControlDefinition, ControlType } from '../controls/controlTypes'

interface Props { definitions: ControlDefinition[]; onAdd: (definition: ControlDefinition) => void }

const CATEGORY_LABELS: Record<ControlCategory, string> = { basic: '기본', layout: '레이아웃' }

// Miniature mockups that mirror each control's real appearance instead of a generic box.
function Preview({ type }: { type: string }) {
  switch (type as ControlType) {
    case 'text':
      return <span className="control-preview"><span className="mini-line" style={{ width: '80%' }} /></span>
    case 'button':
      return <span className="control-preview"><span className="mini-button">버튼</span></span>
    case 'input':
      return <span className="control-preview"><span className="mini-box mini-placeholder">입력하세요</span></span>
    case 'textarea':
      return <span className="control-preview"><span className="mini-box mini-textarea mini-placeholder">내용을 입력하세요</span></span>
    case 'checkbox':
      return <span className="control-preview mini-row"><span className="mini-check" /><span className="mini-label">선택 항목</span></span>
    case 'radio':
      return <span className="control-preview mini-row"><span className="mini-radio" /><span className="mini-label">라디오 항목</span></span>
    case 'select':
      return <span className="control-preview"><span className="mini-box mini-select"><span className="mini-placeholder-text">옵션 선택</span><span>⌄</span></span></span>
    case 'toggle':
      return <span className="control-preview mini-row"><span className="mini-toggle"><span className="mini-toggle-dot" /></span><span className="mini-label">켜짐</span></span>
    case 'image':
      return <span className="control-preview"><span className="mini-box mini-image"><span className="mini-x" />이미지</span></span>
    case 'icon':
      return <span className="control-preview"><span className="mini-icon-circle" /></span>
    case 'card':
      return <span className="control-preview"><span className="mini-box mini-card"><b>카드 제목</b><span className="mini-line" /><span className="mini-line" style={{ width: '60%' }} /></span></span>
    case 'divider':
      return <span className="control-preview"><span className="mini-divider" /></span>
    case 'topbar':
      return <span className="control-preview"><span className="mini-box mini-topbar"><b>로고</b><span>메뉴 메뉴</span></span></span>
    case 'tabs':
      return <span className="control-preview"><span className="mini-box mini-tabs"><span>홈</span><span>검색</span><span>알림</span><span>설정</span></span></span>
    case 'sidebar':
      return <span className="control-preview"><span className="mini-box mini-sidebar"><b>내비게이션</b><span className="mini-line" /><span className="mini-line" /></span></span>
    case 'modal':
      return <span className="control-preview"><span className="mini-box mini-modal"><span className="mini-modal-head" /><span className="mini-modal-actions"><span className="mini-modal-btn" /><span className="mini-modal-btn" /></span></span></span>
    case 'table':
      return <span className="control-preview"><span className="mini-box mini-table"><span className="mini-table-head" /><span className="mini-table-row" /><span className="mini-table-row" /></span></span>
    case 'mobile':
      return <span className="control-preview"><span className="mini-mobile"><span className="mini-mobile-notch" /></span></span>
    case 'browser':
      return <span className="control-preview"><span className="mini-box mini-browser"><span className="mini-browser-head"><span className="mini-dot" /><span className="mini-dot" /><span className="mini-dot" /></span></span></span>
    default:
      return <span className="control-preview" />
  }
}

export function ControlPalette({ definitions, onAdd }: Props) {
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    const filtered = term ? definitions.filter((item) => item.name.toLowerCase().includes(term)) : definitions
    const byCategory = new Map<ControlCategory, ControlDefinition[]>()
    for (const item of filtered) {
      const list = byCategory.get(item.category) ?? []
      list.push(item)
      byCategory.set(item.category, list)
    }
    return byCategory
  }, [definitions, query])

  return (
    <nav className="control-rail">
      <div className="rail-search">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="컨트롤 검색" />
      </div>
      <div className="rail-scroll">
        {[...groups.entries()].map(([category, items]) => (
          <section key={category} className="rail-group">
            <h3>{CATEGORY_LABELS[category]}</h3>
            <div className="rail-list">
              {items.map((item) => (
                <button key={item.type} className="rail-item" title={item.description} draggable onDragStart={(event) => event.dataTransfer.setData('application/wireframe-control', item.type)} onClick={() => onAdd(item)}>
                  <Preview type={item.type} />
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
        {groups.size === 0 && <p className="rail-empty">일치하는 컨트롤이 없습니다.</p>}
      </div>
    </nav>
  )
}
