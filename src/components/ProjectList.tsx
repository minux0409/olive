import type { RemoteProject } from '../utils/api'

export function ProjectList({ projects, onOpen }: { projects: RemoteProject[]; onOpen: (project: RemoteProject) => void }) {
  return <section className="project-list"><div className="project-list-title"><strong>내 프로젝트</strong><span>{projects.length}개</span></div>{projects.length === 0 ? <p>아직 서버에 저장한 프로젝트가 없습니다.</p> : projects.map((project) => <button key={project.id} onClick={() => onOpen(project)}><strong>{project.name}</strong><small>{new Date(project.updatedAt).toLocaleString('ko-KR')}</small></button>)}</section>
}
