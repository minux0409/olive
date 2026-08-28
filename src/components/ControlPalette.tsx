import type { ControlDefinition } from '../controls/controlTypes'

interface Props { definitions: ControlDefinition[]; onAdd: (definition: ControlDefinition) => void }

function Preview({ type }: { type: string }) {
  return <span className={`control-preview preview-${type}`} aria-hidden="true"><i /><i /><i /></span>
}

export function ControlPalette({ definitions, onAdd }: Props) {
  return (
    <div className="control-bar">
      <span className="control-bar-label">컨트롤</span>
      <div className="control-bar-track">
        {definitions.map((item) => (
          <button key={item.type} className="control-bar-item" title={item.description} draggable onDragStart={(event) => event.dataTransfer.setData('application/wireframe-control', item.type)} onClick={() => onAdd(item)}>
            <Preview type={item.type} /><span>{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
