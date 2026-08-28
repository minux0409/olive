import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import type { ControlDefinition, ControlType } from './controlTypes'

const stroke = '#34383f'
const fill = '#ffffff'
const textColor = '#34383f'

type Skeleton = ExcalidrawElementSkeleton
const rectangle = (x: number, y: number, width: number, height: number, backgroundColor = fill): Skeleton => ({ type: 'rectangle', x, y, width, height, strokeColor: stroke, backgroundColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0 })
const text = (x: number, y: number, value: string, fontSize = 18): Skeleton => ({ type: 'text', x, y, text: value, fontSize, fontFamily: 1, strokeColor: textColor, width: Math.max(24, value.length * fontSize * 0.55), height: fontSize * 1.35, textAlign: 'left', verticalAlign: 'middle' })
// Centers text around (cx, cy) instead of using a top-left origin, so labels stay aligned with their container.
const centeredText = (cx: number, cy: number, value: string, fontSize = 16): Skeleton => {
  const width = Math.max(24, value.length * fontSize * 0.55)
  const height = fontSize * 1.35
  return { type: 'text', x: cx - width / 2, y: cy - height / 2, text: value, fontSize, fontFamily: 1, strokeColor: textColor, width, height, textAlign: 'center', verticalAlign: 'middle' }
}
// Vertically centers text at a fixed left position (for left-aligned labels next to controls).
const leftText = (x: number, cy: number, value: string, fontSize = 16): Skeleton => {
  const height = fontSize * 1.35
  return text(x, cy - height / 2, value, fontSize)
}
const line = (x: number, y: number, points: [number, number][], strokeColor = stroke): Skeleton => ({ type: 'line', x, y, points, strokeColor, strokeWidth: 2, roughness: 0 })
const ellipse = (x: number, y: number, width: number, height: number, backgroundColor = fill): Skeleton => ({ type: 'ellipse', x, y, width, height, strokeColor: stroke, backgroundColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0 })
const diamond = (x: number, y: number, width: number, height: number, backgroundColor = fill): Skeleton => ({ type: 'diamond', x, y, width, height, strokeColor: stroke, backgroundColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0 })

export function createControlElements(definition: ControlDefinition, x: number, y: number) {
  const w = definition.defaultWidth
  const h = definition.defaultHeight
  const groupId = crypto.randomUUID()
  const withGroup = (elements: Skeleton[]) => elements.map((element) => ({ ...element, groupIds: [groupId] }))
  let elements: Skeleton[]
  switch (definition.type as ControlType) {
    case 'text': elements = [text(x, y, '텍스트를 입력하세요')]; break
    case 'button': elements = withGroup([rectangle(x, y, w, h), centeredText(x + w / 2, y + h / 2, '버튼')]); break
    case 'input': elements = withGroup([rectangle(x, y, w, h), leftText(x + 14, y + h / 2, '입력하세요', 16)]); break
    case 'textarea': elements = withGroup([rectangle(x, y, w, h), leftText(x + 14, y + 20, '내용을 입력하세요', 16)]); break
    case 'checkbox': elements = withGroup([rectangle(x, y + h / 2 - 11, 22, 22), leftText(x + 34, y + h / 2, '선택 항목', 16)]); break
    case 'radio': elements = withGroup([ellipse(x, y + h / 2 - 11, 22, 22), leftText(x + 34, y + h / 2, '라디오 항목', 16)]); break
    case 'select': elements = withGroup([rectangle(x, y, w, h), leftText(x + 14, y + h / 2, '옵션을 선택하세요', 16), centeredText(x + w - 20, y + h / 2, '⌄', 22)]); break
    case 'toggle': elements = withGroup([rectangle(x, y + h / 2 - 15, 54, 30, '#dbe3ea'), ellipse(x + 27, y + h / 2 - 12, 24, 24), leftText(x + 70, y + h / 2, '켜짐', 16)]); break
    case 'image': elements = withGroup([rectangle(x, y, w, h), line(x + 10, y + 10, [[0, 0], [w - 20, h - 20]]), line(x + w - 10, y + 10, [[0, h - 20], [-w + 20, 0]]), centeredText(x + w / 2, y + h / 2, '이미지', 16)]); break
    case 'icon-star': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '★', w * 0.45)]); break
    case 'icon-home': {
      const cx = x + w / 2, cy = y + h / 2
      const baseW = w * 0.42, baseH = h * 0.32
      const baseX = cx - baseW / 2, baseY = cy + h * 0.02
      const roofW = w * 0.56, roofH = h * 0.4
      elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), diamond(cx - roofW / 2, baseY - roofH * 0.55, roofW, roofH), rectangle(baseX, baseY, baseW, baseH)])
      break
    }
    case 'icon-search': {
      const cx = x + w / 2, cy = y + h / 2
      const lensSize = w * 0.34
      const lensX = cx - w * 0.1, lensY = cy - h * 0.1
      elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), ellipse(lensX - lensSize / 2, lensY - lensSize / 2, lensSize, lensSize), line(lensX + lensSize * 0.28, lensY + lensSize * 0.28, [[0, 0], [w * 0.16, h * 0.16]])])
      break
    }
    case 'icon-settings': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '⚙', w * 0.42)]); break
    case 'icon-check': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '✓', w * 0.42)]); break
    case 'icon-close': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '✕', w * 0.4)]); break
    case 'icon-plus': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '+', w * 0.5)]); break
    case 'icon-user': {
      const cx = x + w / 2, cy = y + h / 2
      const headSize = w * 0.32
      const bodyW = w * 0.62, bodyH = h * 0.44
      elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), ellipse(cx - headSize / 2, cy - h * 0.32, headSize, headSize), ellipse(cx - bodyW / 2, cy + h * 0.06, bodyW, bodyH)])
      break
    }
    case 'icon-info': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, 'i', w * 0.5)]); break
    case 'icon-heart': elements = withGroup([ellipse(x, y, w, h, '#f7f8f9'), centeredText(x + w / 2, y + h / 2, '♥', w * 0.42)]); break
    case 'card': elements = withGroup([rectangle(x, y, w, h), text(x + 18, y + 18, '카드 제목'), line(x + 18, y + 54, [[0, 0], [w - 36, 0]]), text(x + 18, y + 76, '카드 콘텐츠', 16)]); break
    case 'divider': elements = [line(x, y + 5, [[0, 0], [w, 0]])]; break
    case 'topbar': elements = withGroup([rectangle(x, y, w, h), leftText(x + 18, y + h / 2, '로고'), leftText(x + w - 128, y + h / 2, '메뉴   메뉴', 15)]); break
    case 'tabs': elements = withGroup([rectangle(x, y, w, h), line(x + w / 4, y, [[0, 0], [0, h]]), line(x + w / 2, y, [[0, 0], [0, h]]), line(x + w * 0.75, y, [[0, 0], [0, h]]), centeredText(x + w / 8, y + h / 2, '홈', 15), centeredText(x + w * 3 / 8, y + h / 2, '검색', 15), centeredText(x + w * 5 / 8, y + h / 2, '알림', 15), centeredText(x + w * 7 / 8, y + h / 2, '설정', 15)]); break
    case 'sidebar': elements = withGroup([rectangle(x, y, w, h), text(x + 18, y + 22, '내비게이션'), text(x + 18, y + 75, '메뉴 항목', 16), text(x + 18, y + 112, '메뉴 항목', 16), text(x + 18, y + 149, '메뉴 항목', 16)]); break
    case 'modal': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 52, '#eef1f3'), leftText(x + 18, y + 26, '팝업 제목', 17), text(x + 18, y + 76, '팝업 내용을 입력하세요', 16), rectangle(x + w - 174, y + h - 52, 72, 34, '#eef1f3'), centeredText(x + w - 138, y + h - 35, '취소', 14), rectangle(x + w - 90, y + h - 52, 72, 34), centeredText(x + w - 54, y + h - 35, '확인', 14)]); break
    case 'table': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 42, '#eef1f3'), line(x + w / 3, y, [[0, 0], [0, h]]), line(x + w * 2 / 3, y, [[0, 0], [0, h]]), line(x, y + 42, [[0, 0], [w, 0]]), line(x, y + 79, [[0, 0], [w, 0]]), line(x, y + 116, [[0, 0], [w, 0]]), centeredText(x + w / 6, y + 21, '항목', 14), centeredText(x + w / 2, y + 21, '상태', 14), centeredText(x + w * 5 / 6, y + 21, '날짜', 14)]); break
    case 'mobile': elements = withGroup([rectangle(x, y, w, h, '#f7f8f9'), rectangle(x + 12, y + 28, w - 24, h - 48), line(x + 12, y + 28, [[0, 0], [w - 24, 0]]), ellipse(x + w / 2 - 18, y + 8, 36, 8), centeredText(x + w / 2, y + h / 2, '모바일 화면', 16)]); break
    case 'browser': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 34, '#eef1f3'), ellipse(x + 14, y + 12, 8, 8), ellipse(x + 30, y + 12, 8, 8), ellipse(x + 46, y + 12, 8, 8), rectangle(x + 80, y + 8, w - 98, 18), centeredText(x + w / 2, y + (h + 34) / 2, '웹 페이지', 17)]); break
  }
  return convertToExcalidrawElements(elements, { regenerateIds: true })
}
