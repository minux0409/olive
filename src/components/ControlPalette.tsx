import { useMemo, useState } from 'react'
import type { ControlCategory, ControlDefinition } from '../controls/controlTypes'

interface Props { definitions: ControlDefinition[]; onAdd: (definition: ControlDefinition) => void }

const CATEGORY_LABELS: Record<ControlCategory, string> = { basic: '기본', layout: '레이아웃' }

function Preview({ type }: { type: string }) {
  return <span className={`control-preview preview-${type}`} aria-hidden="true"><i /><i /><i /></span>
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
