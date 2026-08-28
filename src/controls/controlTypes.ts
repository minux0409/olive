export type ControlCategory = 'basic' | 'layout' | 'icon'

export type ControlType =
  | 'text' | 'button' | 'input' | 'textarea' | 'checkbox' | 'radio' | 'select' | 'toggle' | 'image'
  | 'card' | 'divider' | 'topbar' | 'tabs' | 'sidebar' | 'modal' | 'table' | 'mobile' | 'browser'
  | 'icon-star' | 'icon-home' | 'icon-search' | 'icon-settings' | 'icon-check' | 'icon-close' | 'icon-plus' | 'icon-user' | 'icon-info' | 'icon-heart'

export interface ControlDefinition {
  type: ControlType
  name: string
  category: ControlCategory
  description: string
  defaultWidth: number
  defaultHeight: number
}
