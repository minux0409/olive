import cors from 'cors'
import express from 'express'
import crypto from 'node:crypto'

const app = express()
const port = Number(process.env.PORT || 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN || 'http://localhost:5174'
const user = { id: 'super', password: '1234', name: '슈퍼 관리자' }
const sessions = new Map()
const projects = new Map()

app.use(cors({ origin: frontendOrigin }))
app.use(express.json({ limit: '10mb' }))

function authToken(request) {
  const header = request.headers.authorization
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}
function requireAuth(request, response, next) {
  const token = authToken(request)
  const session = token ? sessions.get(token) : null
  if (!session) return response.status(401).json({ message: '로그인이 필요합니다.' })
  request.userId = session.userId
  request.token = token
  next()
}
function projectSummary(project) {
  return { id: project.id, name: project.name, updatedAt: project.updatedAt, shareUrl: `/share/${project.id}` }
}

app.get('/api/health', (_request, response) => response.json({ ok: true }))
app.post('/api/auth/login', (request, response) => {
  const { id, password } = request.body ?? {}
  if (id !== user.id || password !== user.password) return response.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  const token = crypto.randomBytes(24).toString('hex')
  sessions.set(token, { userId: user.id })
  response.json({ token, user: { id: user.id, name: user.name } })
})
app.post('/api/auth/logout', requireAuth, (request, response) => { sessions.delete(request.token); response.status(204).end() })
app.get('/api/auth/me', requireAuth, (_request, response) => response.json({ id: user.id, name: user.name }))
app.get('/api/projects', requireAuth, (_request, response) => response.json([...projects.values()].map(projectSummary)))
app.post('/api/projects', requireAuth, (request, response) => {
  const { name, document } = request.body ?? {}
  if (typeof name !== 'string' || !document || typeof document !== 'object') return response.status(400).json({ message: '프로젝트 데이터가 올바르지 않습니다.' })
  const now = new Date().toISOString()
  const project = { id: crypto.randomUUID(), ownerId: user.id, name, document, createdAt: now, updatedAt: now }
  projects.set(project.id, project)
  response.status(201).json(projectSummary(project))
})
app.put('/api/projects/:id', requireAuth, (request, response) => {
  const project = projects.get(request.params.id)
  if (!project || project.ownerId !== request.userId) return response.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' })
  const { name, document } = request.body ?? {}
  if (typeof name !== 'string' || !document || typeof document !== 'object') return response.status(400).json({ message: '프로젝트 데이터가 올바르지 않습니다.' })
  project.name = name; project.document = document; project.updatedAt = new Date().toISOString()
  response.json(projectSummary(project))
})
app.get('/api/projects/:id', (request, response) => {
  const project = projects.get(request.params.id)
  if (!project) return response.status(404).json({ message: '공유 프로젝트를 찾을 수 없습니다.' })
  response.json({ id: project.id, name: project.name, document: project.document, updatedAt: project.updatedAt })
})
app.delete('/api/projects/:id', requireAuth, (request, response) => {
  const project = projects.get(request.params.id)
  if (!project || project.ownerId !== request.userId) return response.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' })
  projects.delete(project.id); response.status(204).end()
})

app.listen(port, '0.0.0.0', () => console.log(`Wireframe Studio API listening on http://localhost:${port}`))
