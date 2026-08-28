import { useEffect, useRef, useState } from 'react'
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types'
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types'
import { ControlPalette } from './components/ControlPalette'
import { GuestCanvas } from './components/GuestCanvas'
import { LoginScreen } from './components/LoginScreen'
import { ProjectList } from './components/ProjectList'
import { PropertiesPanel } from './components/PropertiesPanel'
import { SlidePanel } from './components/SlidePanel'
import { Toast, type ToastMessage } from './components/Toast'
import { TopToolbar } from './components/TopToolbar'
import { WireframeCanvas } from './components/WireframeCanvas'
import { controlDefinitions } from './controls/controlDefinitions'
import { createControlElements } from './controls/createControlElements'
import type { ControlDefinition } from './controls/controlTypes'
import type { Slide } from './types/project'
import { downloadPng } from './utils/exportImage'
import { createSlide, makeProjectFile, parseProjectFile } from './utils/projectFile'
import { api } from './utils/api'
import './App.css'

const STORAGE_KEY = 'wireframe-studio-project'

function GuestRoute({ shareId }: { shareId: string }) {
  const [guestProject, setGuestProject] = useState<Awaited<ReturnType<typeof api.sharedProject>> | null>(null)
  const [guestError, setGuestError] = useState('')
  useEffect(() => { api.sharedProject(shareId).then(setGuestProject).catch((reason: unknown) => setGuestError(reason instanceof Error ? reason.message : '공유 프로젝트를 불러오지 못했습니다.')) }, [shareId])
  if (guestError) return <main className="guest-error"><h1>공유 프로젝트를 열 수 없습니다.</h1><p>{guestError}</p></main>
  if (!guestProject) return <main className="guest-error"><p>공유 프로젝트를 불러오는 중입니다...</p></main>
  
  let firstSlide: Slide | undefined
  try {
    firstSlide = parseProjectFile(guestProject.document).slides[0]
  } catch {
    firstSlide = undefined
  }
  if (!firstSlide) return <main className="guest-error"><p>슬라이드가 없습니다.</p></main>
  
  return <GuestCanvas name={guestProject.name} elements={firstSlide.elements ?? []} appState={firstSlide.appState ?? {}} files={firstSlide.files ?? {}} />
}

function EditorApp() {
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('wireframe-token')))
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null)
  const saveTimer = useRef<number | undefined>(undefined)
  const restorePending = useRef(true)
  
  // Slide management states
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideId, setCurrentSlideId] = useState<string | undefined>()
  
  // Canvas states
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([])
  const [appState, setAppState] = useState<AppState | null>(null)
  const [files, setFiles] = useState<BinaryFiles>({})
  
  const [projectName, setProjectName] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return '내 와이어프레임'
    try { return parseProjectFile(JSON.parse(saved)).projectName } catch { return '내 와이어프레임' }
  })
  const [status, setStatus] = useState('저장됨')
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [messages, setMessages] = useState<ToastMessage[]>([])
  const [pendingType, setPendingType] = useState<ControlDefinition | null>(null)
  const [serverProjectId, setServerProjectId] = useState<string | undefined>()
  const [shareUrl, setShareUrl] = useState<string | undefined>()
  const [projects, setProjects] = useState<Awaited<ReturnType<typeof api.projects>>>([])
  const [showProjects, setShowProjects] = useState(false)
  const selected = elements.find((element) => appState?.selectedElementIds[element.id]) ?? null

  const toast = (text: string, kind: ToastMessage['kind'] = 'info') => {
    const id = Date.now()
    setMessages((current) => [...current, { id, kind, text }])
    window.setTimeout(() => setMessages((current) => current.filter((message) => message.id !== id)), 3200)
  }

  // Initialize first slide on component mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) {
      restorePending.current = false
      const firstSlide = createSlide('Slide 1', [], {}, {})
      setSlides([firstSlide])
      setCurrentSlideId(firstSlide.id)
      return
    }
    try {
      const project = parseProjectFile(JSON.parse(saved))
      if (project.slides && project.slides.length > 0) {
        setSlides(project.slides)
        setCurrentSlideId(project.slides[0].id)
        const firstSlide = project.slides[0]
        setElements(firstSlide.elements)
        setFiles(firstSlide.files)
        window.setTimeout(() => {
          const api = apiRef.current
          if (api) {
            api.updateScene({
              elements: firstSlide.elements,
              appState: { ...api.getAppState(), ...firstSlide.appState, collaborators: new Map() }
            })
            api.addFiles(Object.values(firstSlide.files))
          }
          window.setTimeout(() => { restorePending.current = false }, 5000)
        }, 0)
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
      restorePending.current = false
      const firstSlide = createSlide('Slide 1', [], {}, {})
      setSlides([firstSlide])
      setCurrentSlideId(firstSlide.id)
    }
  }, [])

  const addControl = (definition: ControlDefinition, x?: number, y?: number) => {
    const api = apiRef.current
    if (!api) return
    const state = api.getAppState()
    const zoom = state.zoom.value
    const sceneX = x ?? -state.scrollX + (state.width / zoom - definition.defaultWidth) / 2
    const sceneY = y ?? -state.scrollY + (state.height / zoom - definition.defaultHeight) / 2
    const created = createControlElements(definition, sceneX, sceneY)
    const nextElements = [...api.getSceneElements(), ...created]
    api.updateScene({ elements: nextElements })
    setElements(nextElements)
    setAppState(state)
    setPendingType(null)
    toast(`${definition.name} 컨트롤을 추가했습니다.`, 'success')
  }

  const onChange = (nextElements: readonly ExcalidrawElement[], nextAppState: AppState, nextFiles: BinaryFiles) => {
    setElements(nextElements)
    setAppState(nextAppState)
    setFiles(nextFiles)
    if (restorePending.current) return
    
    setStatus('자동 저장 중...')
    window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(() => {
      // Update current slide
      if (currentSlideId && slides.length > 0) {
        const updatedSlides = slides.map(s =>
          s.id === currentSlideId
            ? { ...s, elements: nextElements, appState: { ...nextAppState, collaborators: undefined }, files: nextFiles, updatedAt: new Date().toISOString() }
            : s
        )
        setSlides(updatedSlides)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(makeProjectFile(projectName, updatedSlides)))
      }
      setStatus('자동 저장 완료')
    }, 700)
  }

  const handleSlideSelect = (slideId: string) => {
    const newSlide = slides.find(s => s.id === slideId)
    if (!newSlide) return
    
    setCurrentSlideId(slideId)
    setElements(newSlide.elements ?? [])
    setFiles(newSlide.files ?? {})
    
    const api = apiRef.current
    if (api) {
      api.updateScene({
        elements: newSlide.elements ?? [],
        appState: { ...api.getAppState(), ...newSlide.appState, collaborators: new Map() }
      })
      api.addFiles(Object.values(newSlide.files ?? {}))
    }
  }

  const handleAddSlide = (name: string) => {
    const newSlide = createSlide(name, [], {}, {})
    const updatedSlides = [...slides, newSlide]
    setSlides(updatedSlides)
    setCurrentSlideId(newSlide.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeProjectFile(projectName, updatedSlides)))
    
    const api = apiRef.current
    if (api) {
      api.resetScene()
      setElements([])
      setFiles({})
    }
    toast(`'${name}' 슬라이드를 추가했습니다.`, 'success')
  }

  const handleRenameSlide = (slideId: string, newName: string) => {
    const updatedSlides = slides.map(s =>
      s.id === slideId
        ? { ...s, name: newName, updatedAt: new Date().toISOString() }
        : s
    )
    setSlides(updatedSlides)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeProjectFile(projectName, updatedSlides)))
    toast(`슬라이드 이름을 변경했습니다.`, 'success')
  }

  const handleDeleteSlide = (slideId: string) => {
    if (slides.length === 1) {
      toast('최소 1개 이상의 슬라이드가 필요합니다.', 'error')
      return
    }
    
    const updatedSlides = slides.filter(s => s.id !== slideId)
    setSlides(updatedSlides)
    
    // Select first slide if we're deleting the current one
    if (currentSlideId === slideId) {
      const firstSlide = updatedSlides[0]
      setCurrentSlideId(firstSlide.id)
      setElements(firstSlide.elements)
      setFiles(firstSlide.files)
      const api = apiRef.current
      if (api) {
        api.updateScene({
          elements: firstSlide.elements,
          appState: { ...api.getAppState(), ...firstSlide.appState, collaborators: new Map() }
        })
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(makeProjectFile(projectName, updatedSlides)))
    toast('슬라이드를 삭제했습니다.', 'success')
  }

  const saveFile = () => {
    if (!appState) return
    const blob = new Blob([JSON.stringify(makeProjectFile(projectName, slides), null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.download = `${projectName || 'wireframe'}.wireframe.json`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
    setStatus('저장됨')
    toast('프로젝트 파일을 저장했습니다.', 'success')
  }

  const openFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.wireframe.json,application/json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const project = parseProjectFile(JSON.parse(String(reader.result)))
          if (!project.slides || project.slides.length === 0) throw new Error('슬라이드가 없는 파일입니다.')
          
          setSlides(project.slides)
          setProjectName(project.projectName)
          
          const firstSlide = project.slides[0]
          setCurrentSlideId(firstSlide.id)
          setElements(firstSlide.elements)
          setFiles(firstSlide.files)
          
          const api = apiRef.current
          if (api) {
            api.updateScene({
              elements: firstSlide.elements,
              appState: { ...api.getAppState(), ...firstSlide.appState, collaborators: new Map() }
            })
            api.addFiles(Object.values(firstSlide.files))
          }
          toast('프로젝트를 복원했습니다.', 'success')
        } catch (error) {
          toast(error instanceof Error ? error.message : '파일을 읽지 못했습니다.', 'error')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const clear = () => {
    apiRef.current?.resetScene()
    toast('캔버스를 비웠습니다.', 'success')
  }

  const newProject = () => {
    if (slides.some(s => s.elements.length > 0) && !window.confirm('저장되지 않은 변경사항을 버리고 새 프로젝트를 시작할까요?')) return
    
    const firstSlide = createSlide('Slide 1', [], {}, {})
    apiRef.current?.resetScene()
    setProjectName('내 와이어프레임')
    setSlides([firstSlide])
    setCurrentSlideId(firstSlide.id)
    setElements([])
    setFiles({})
    setServerProjectId(undefined)
    setShareUrl(undefined)
    toast('새 프로젝트를 시작했습니다.', 'success')
  }

  const updateSelected = (patch: Partial<ExcalidrawElement>) => {
    if (!selected || !apiRef.current) return
    apiRef.current.updateScene({
      elements: apiRef.current.getSceneElements().map((element) =>
        element.id === selected.id ? { ...element, ...patch } as ExcalidrawElement : element
      )
    })
  }

  const handleDrop = (type: string, clientX: number, clientY: number) => {
    const definition = controlDefinitions.find((item) => item.type === type)
    const state = apiRef.current?.getAppState()
    if (!definition || !state) return
    const zoom = state.zoom.value
    addControl(definition, clientX / zoom - state.scrollX - definition.defaultWidth / 2, clientY / zoom - state.scrollY - definition.defaultHeight / 2)
  }

  const exportPng = async () => {
    try {
      if (!appState) return
      await downloadPng(elements, appState, files, projectName)
      toast('PNG 파일을 내보냈습니다.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : 'PNG 내보내기에 실패했습니다.', 'error')
    }
  }

  const saveToServer = async () => {
    if (!appState) return
    try {
      const result = await api.saveProject(projectName, { ...makeProjectFile(projectName, slides) }, serverProjectId)
      setServerProjectId(result.id)
      const addresses = await api.networkAddresses()
      const baseUrl = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? window.location.origin
        : addresses[0]?.shareBaseUrl || window.location.origin
      const link = `${baseUrl}/share/${result.id}`
      setShareUrl(link)
      setStatus('서버 저장 완료')
      await navigator.clipboard?.writeText(link)
      toast('서버에 저장했습니다. 아래 공유 URL을 사용할 수 있습니다.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : '서버 저장에 실패했습니다.', 'error')
    }
  }

  const copyShareUrl = async () => {
    if (!shareUrl) return
    await navigator.clipboard?.writeText(shareUrl)
    toast('공유 URL을 복사했습니다.', 'success')
  }

  const showProjectList = async () => {
    try {
      setProjects(await api.projects())
      setShowProjects(true)
    } catch (error) {
      toast(error instanceof Error ? error.message : '프로젝트 목록을 불러오지 못했습니다.', 'error')
    }
  }

  const openRemoteProject = async (project: Awaited<ReturnType<typeof api.projects>>[number]) => {
    try {
      const remote = await api.sharedProject(project.id)
      const restored = parseProjectFile(remote.document)
      
      setSlides(restored.slides)
      setProjectName(remote.name)
      setServerProjectId(remote.id)
      
      const firstSlide = restored.slides[0]
      setCurrentSlideId(firstSlide.id)
      setElements(firstSlide.elements)
      setFiles(firstSlide.files)
      
      const editor = apiRef.current
      if (editor) {
        editor.updateScene({
          elements: firstSlide.elements,
          appState: { ...editor.getAppState(), ...firstSlide.appState, collaborators: new Map() }
        })
        window.setTimeout(() => editor.scrollToContent(firstSlide.elements, { fitToContent: true, animate: true }), 50)
      }
      
      const addresses = await api.networkAddresses()
      const baseUrl = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
        ? window.location.origin
        : addresses[0]?.shareBaseUrl || window.location.origin
      setShareUrl(`${baseUrl}/share/${remote.id}`)
      setShowProjects(false)
      toast('프로젝트를 열었습니다.', 'success')
    } catch (error) {
      toast(error instanceof Error ? error.message : '프로젝트를 열지 못했습니다.', 'error')
    }
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />

  return (
    <div className="studio">
      <TopToolbar
        projectName={projectName}
        setProjectName={setProjectName}
        status={status}
        shareUrl={shareUrl}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        onNew={newProject}
        onProjects={showProjectList}
        onOpen={openFile}
        onSave={saveFile}
        onServerSave={saveToServer}
        onCopyShare={copyShareUrl}
        onPng={exportPng}
        onClear={clear}
        onLogout={() => { localStorage.removeItem('wireframe-token'); setLoggedIn(false) }}
        toggleLeft={() => setLeftOpen(!leftOpen)}
        toggleRight={() => setRightOpen(!rightOpen)}
      />
      <div className="workspace">
        {leftOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid #ddd', width: '200px', overflow: 'hidden' }}>
            <SlidePanel
              slides={slides}
              currentSlideId={currentSlideId}
              onSelectSlide={handleSlideSelect}
              onAddSlide={handleAddSlide}
              onRenameSlide={handleRenameSlide}
              onDeleteSlide={handleDeleteSlide}
            />
          </div>
        )}
        <ControlPalette definitions={controlDefinitions} onAdd={(definition) => addControl(definition)} />
        <div className="canvas-wrap">
          <WireframeCanvas
            onMount={(api) => { apiRef.current = api }}
            onChange={onChange}
            onDropControl={handleDrop}
            onAddAtCenter={() => setPendingType(controlDefinitions[0])}
            empty={!elements.length}
          />
        </div>
        {rightOpen && <PropertiesPanel element={selected} onUpdate={updateSelected} />}
      </div>
      {showProjects && (
        <div className="project-list-wrap">
          <ProjectList projects={projects} onOpen={openRemoteProject} />
          <button onClick={() => setShowProjects(false)}>닫기</button>
        </div>
      )}
      {pendingType && (
        <div className="quick-add">
          <span>추가할 컨트롤을 선택하세요</span>
          <div>
            {controlDefinitions.map((definition) => (
              <button key={definition.type} onClick={() => addControl(definition)}>
                {definition.name}
              </button>
            ))}
          </div>
          <button className="close-quick" onClick={() => setPendingType(null)}>
            닫기
          </button>
        </div>
      )}
      <Toast messages={messages} />
    </div>
  )
}

function App() {
  const shareId = window.location.pathname.match(/^\/share\/([^/]+)/)?.[1]
  const [loggedIn, setLoggedIn] = useState(() => Boolean(localStorage.getItem('wireframe-token')))
  if (shareId) return <GuestRoute shareId={shareId} />
  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />
  return <EditorApp />
}

export default App
