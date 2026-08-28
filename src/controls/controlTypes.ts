export type ControlCategory = 'basic' | 'layout'

export type ControlType =
  | 'text' | 'button' | 'input' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'toggle' | 'image' | 'icon'
  | 'card' | 'divider' | 'topbar' | 'tabs' | 'sidebar' | 'modal' | 'table' | 'mobile' | 'browser'

export interface ControlDefinition {
  type: ControlType
  name: string
  category: ControlCategory
  description: string
  defaultWidth: number
  defaultHeight: number
}
