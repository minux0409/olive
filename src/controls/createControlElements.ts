import { convertToExcalidrawElements } from '@excalidraw/excalidraw'
import type { ExcalidrawElementSkeleton } from '@excalidraw/excalidraw/data/transform'
import type { ControlDefinition, ControlType } from './controlTypes'

const stroke = '#34383f'
const fill = '#ffffff'
const textColor = '#34383f'

type Skeleton = ExcalidrawElementSkeleton
const rectangle = (x: number, y: number, width: number, height: number, backgroundColor = fill): Skeleton => ({ type: 'rectangle', x, y, width, height, strokeColor: stroke, backgroundColor, fillStyle: 'solid', strokeWidth: 2, roughness: 0 })
const text = (x: number, y: number, value: string, fontSize = 18): Skeleton => ({ type: 'text', x, y, text: value, fontSize, fontFamily: 1, strokeColor: textColor, width: Math.max(24, value.length * fontSize * 0.55), height: fontSize * 1.35, textAlign: 'left', verticalAlign: 'middle' })
const line = (x: number, y: number, points: [number, number][], strokeColor = stroke): Skeleton => ({ type: 'line', x, y, points, strokeColor, strokeWidth: 2, roughness: 0 })
const ellipse = (x: number, y: number, width: number, height: number): Skeleton => ({ type: 'ellipse', x, y, width, height, strokeColor: stroke, backgroundColor: fill, fillStyle: 'solid', strokeWidth: 2, roughness: 0 })

export function createControlElements(definition: ControlDefinition, x: number, y: number) {
  const w = definition.defaultWidth
  const h = definition.defaultHeight
  const groupId = crypto.randomUUID()
  const withGroup = (elements: Skeleton[]) => elements.map((element) => ({ ...element, groupIds: [groupId] }))
  let elements: Skeleton[]
  switch (definition.type as ControlType) {
    case 'text': elements = [text(x, y, '텍스트를 입력하세요')]; break
    case 'button': elements = withGroup([rectangle(x, y, w, h), text(x + 38, y + 12, '버튼')]); break
    case 'input': elements = withGroup([rectangle(x, y, w, h), text(x + 14, y + 11, '입력하세요', 16)]); break
    case 'textarea': elements = withGroup([rectangle(x, y, w, h), text(x + 14, y + 12, '내용을 입력하세요', 16)]); break
    case 'checkbox': elements = withGroup([rectangle(x, y + 7, 22, 22), text(x + 34, y + 5, '선택 항목', 16)]); break
    case 'radio': elements = withGroup([ellipse(x, y + 7, 22, 22), text(x + 34, y + 5, '라디오 항목', 16)]); break
    case 'select': elements = withGroup([rectangle(x, y, w, h), text(x + 14, y + 11, '옵션을 선택하세요', 16), text(x + w - 30, y + 9, '⌄', 24)]); break
    case 'toggle': elements = withGroup([rectangle(x, y + 4, 54, 30, '#dbe3ea'), ellipse(x + 27, y + 7, 24, 24), text(x + 70, y + 7, '켜짐', 16)]); break
    case 'image': elements = withGroup([rectangle(x, y, w, h), line(x + 10, y + 10, [[0, 0], [w - 20, h - 20]]), line(x + w - 10, y + 10, [[0, h - 20], [-w + 20, 0]]), text(x + 68, y + h / 2 - 10, '이미지', 16)]); break
    case 'icon': elements = withGroup([rectangle(x, y, w, h, '#f7f8f9'), ellipse(x + w / 2 - 14, y + h / 2 - 14, 28, 28)]); break
    case 'card': elements = withGroup([rectangle(x, y, w, h), text(x + 18, y + 18, '카드 제목'), line(x + 18, y + 54, [[0, 0], [w - 36, 0]]), text(x + 18, y + 76, '카드 콘텐츠', 16)]); break
    case 'divider': elements = [line(x, y + 5, [[0, 0], [w, 0]])]; break
    case 'topbar': elements = withGroup([rectangle(x, y, w, h), text(x + 18, y + 17, '로고'), text(x + w - 128, y + 17, '메뉴   메뉴', 15)]); break
    case 'tabs': elements = withGroup([rectangle(x, y, w, h), line(x + w / 4, y, [[0, 0], [0, h]]), line(x + w / 2, y, [[0, 0], [0, h]]), line(x + w * 0.75, y, [[0, 0], [0, h]]), text(x + 22, y + 19, '홈', 15), text(x + 110, y + 19, '검색', 15), text(x + 200, y + 19, '알림', 15), text(x + 288, y + 19, '설정', 15)]); break
    case 'sidebar': elements = withGroup([rectangle(x, y, w, h), text(x + 18, y + 22, '내비게이션'), text(x + 18, y + 75, '메뉴 항목', 16), text(x + 18, y + 112, '메뉴 항목', 16), text(x + 18, y + 149, '메뉴 항목', 16)]); break
    case 'modal': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 52, '#eef1f3'), text(x + 18, y + 16, '팝업 제목', 17), text(x + 18, y + 76, '팝업 내용을 입력하세요', 16), rectangle(x + w - 174, y + h - 52, 72, 34, '#eef1f3'), text(x + w - 157, y + h - 43, '취소', 14), rectangle(x + w - 90, y + h - 52, 72, 34), text(x + w - 73, y + h - 43, '확인', 14)]); break
    case 'table': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 42, '#eef1f3'), line(x + w / 3, y, [[0, 0], [0, h]]), line(x + w * 2 / 3, y, [[0, 0], [0, h]]), line(x, y + 42, [[0, 0], [w, 0]]), line(x, y + 79, [[0, 0], [w, 0]]), line(x, y + 116, [[0, 0], [w, 0]]), text(x + 18, y + 12, '항목', 14), text(x + 140, y + 12, '상태', 14), text(x + 260, y + 12, '날짜', 14)]); break
    case 'mobile': elements = withGroup([rectangle(x, y, w, h, '#f7f8f9'), rectangle(x + 12, y + 28, w - 24, h - 48), line(x + 12, y + 28, [[0, 0], [w - 24, 0]]), ellipse(x + w / 2 - 18, y + 8, 36, 8), text(x + 58, y + 70, '모바일 화면', 16)]); break
    case 'browser': elements = withGroup([rectangle(x, y, w, h), rectangle(x, y, w, 34, '#eef1f3'), ellipse(x + 14, y + 12, 8, 8), ellipse(x + 30, y + 12, 8, 8), ellipse(x + 46, y + 12, 8, 8), rectangle(x + 80, y + 8, w - 98, 18), text(x + 26, y + 75, '웹 페이지', 17)]); break
  }
  return convertToExcalidrawElements(elements, { regenerateIds: true })
}
