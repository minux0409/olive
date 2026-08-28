import type { ControlDefinition } from './controlTypes'

export const controlDefinitions: ControlDefinition[] = [
  { type: 'text', name: '텍스트', category: 'basic', description: '화면에 표시할 문장', defaultWidth: 180, defaultHeight: 40 },
  { type: 'button', name: '버튼', category: 'basic', description: '클릭 동작을 나타내는 기본 버튼', defaultWidth: 140, defaultHeight: 44 },
  { type: 'input', name: '텍스트 입력창', category: 'basic', description: '한 줄 텍스트 입력 영역', defaultWidth: 220, defaultHeight: 42 },
  { type: 'textarea', name: '텍스트 영역', category: 'basic', description: '여러 줄 텍스트 입력 영역', defaultWidth: 240, defaultHeight: 110 },
  { type: 'checkbox', name: '체크박스', category: 'basic', description: '복수 선택 항목', defaultWidth: 170, defaultHeight: 36 },
  { type: 'radio', name: '라디오 버튼', category: 'basic', description: '단일 선택 항목', defaultWidth: 170, defaultHeight: 36 },
  { type: 'select', name: '드롭다운', category: 'basic', description: '옵션 목록 선택 상자', defaultWidth: 210, defaultHeight: 42 },
  { type: 'toggle', name: '토글 스위치', category: 'basic', description: '설정의 켜기와 끄기', defaultWidth: 150, defaultHeight: 38 },
  { type: 'image', name: '이미지 자리표시자', category: 'basic', description: '이미지가 들어갈 영역', defaultWidth: 220, defaultHeight: 140 },
  { type: 'icon', name: '아이콘', category: 'basic', description: '아이콘이 들어갈 자리표시자', defaultWidth: 56, defaultHeight: 56 },
  { type: 'card', name: '카드', category: 'layout', description: '콘텐츠를 담는 영역', defaultWidth: 280, defaultHeight: 180 },
  { type: 'divider', name: '구분선', category: 'layout', description: '콘텐츠를 나누는 선', defaultWidth: 320, defaultHeight: 12 },
  { type: 'topbar', name: '상단바', category: 'layout', description: '페이지 상단 내비게이션', defaultWidth: 420, defaultHeight: 64 },
  { type: 'tabs', name: '하단 탭바', category: 'layout', description: '네 개의 하단 탐색 탭', defaultWidth: 360, defaultHeight: 62 },
  { type: 'sidebar', name: '사이드바', category: 'layout', description: '페이지 측면 내비게이션', defaultWidth: 180, defaultHeight: 360 },
  { type: 'modal', name: '팝업창', category: 'layout', description: '확인과 취소가 있는 대화상자', defaultWidth: 320, defaultHeight: 220 },
  { type: 'table', name: '테이블', category: 'layout', description: '헤더와 세 행으로 된 표', defaultWidth: 360, defaultHeight: 190 },
  { type: 'mobile', name: '모바일 화면 프레임', category: 'layout', description: '모바일 기기 외곽 프레임', defaultWidth: 240, defaultHeight: 430 },
  { type: 'browser', name: '웹 브라우저 프레임', category: 'layout', description: '브라우저 창 외곽 프레임', defaultWidth: 420, defaultHeight: 280 },
]
