import type { ControlDefinition, ControlCategory } from '../controls/controlTypes'

interface Props { definitions: ControlDefinition[]; onAdd: (definition: ControlDefinition) => void }

function Preview({ type }: { type: string }) {
  return <span className={`control-preview preview-${type}`} aria-hidden="true"><i /><i /><i /></span>
}

export function ControlPalette({ definitions, onAdd }: Props) {
  const renderCategory = (category: ControlCategory, title: string) => (
    <section className="palette-section">
      <h2>{title}</h2>
      <div className="control-grid">
        {definitions.filter((item) => item.category === category).map((item) => (
          <button key={item.type} className="control-card" title={item.description} draggable onDragStart={(event) => event.dataTransfer.setData('application/wireframe-control', item.type)} onClick={() => onAdd(item)}>
            <Preview type={item.type} /><span>{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  )
  return <aside className="control-sidebar"><div className="panel-heading"><div><span className="eyebrow">LIBRARY</span><h1>컨트롤</h1></div><span className="count">{definitions.length}</span></div>{renderCategory('basic', '기본')}{renderCategory('layout', '레이아웃')}</aside>
}
