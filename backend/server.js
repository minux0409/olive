import cors from 'cors'
import express from 'express'
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = Number(process.env.PORT || 4000)
const user = { id: 'super', password: '1234', name: '슈퍼 관리자' }
const projects = new Map()

// Persist the signing secret to disk so login tokens survive server restarts during development.
const secretPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '.auth-secret')
const authSecret = process.env.AUTH_SECRET || (() => {
  if (fs.existsSync(secretPath)) return fs.readFileSync(secretPath, 'utf8').trim()
  const generated = crypto.randomBytes(32).toString('hex')
  fs.writeFileSync(secretPath, generated)
  return generated
})()
const TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function base64url(input) {
  return Buffer.from(input).toString('base64url')
}
function sign(payload) {
  return crypto.createHmac('sha256', authSecret).update(payload).digest('base64url')
}
function issueToken(userId) {
  const payload = base64url(JSON.stringify({ userId, exp: Date.now() + TOKEN_TTL_MS }))
  return `${payload}.${sign(payload)}`
}
function verifyToken(token) {
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  if (sign(payload) !== signature) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (typeof data.exp !== 'number' || data.exp < Date.now()) return null
    return data
  } catch {
    return null
  }
}

app.use(cors({ origin: true }))
app.use(express.json({ limit: '10mb' }))

function authToken(request) {
  const header = request.headers.authorization
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}
function requireAuth(request, response, next) {
  const token = authToken(request)
  const session = token ? verifyToken(token) : null
  if (!session) return response.status(401).json({ message: '로그인이 필요합니다.' })
  request.userId = session.userId
  request.token = token
  next()
}
function projectSummary(project) {
  return { id: project.id, name: project.name, updatedAt: project.updatedAt, shareUrl: `/share/${project.id}`, slideCount: project.document.slides?.length ?? 0 }
}

app.get('/api/health', (_request, response) => response.json({ ok: true }))
app.get('/api/network-addresses', (_request, response) => {
  const addresses = Object.values(os.networkInterfaces()).flatMap((items) => items ?? []).filter((item) => item.family === 'IPv4' && !item.internal).map((item) => ({ address: item.address, shareBaseUrl: `http://${item.address}:${process.env.FRONTEND_PORT || '5174'}` }))
  response.json(addresses)
})
app.post('/api/auth/login', (request, response) => {
  const { id, password } = request.body ?? {}
  if (id !== user.id || password !== user.password) return response.status(401).json({ message: '아이디 또는 비밀번호가 올바르지 않습니다.' })
  const token = issueToken(user.id)
  response.json({ token, user: { id: user.id, name: user.name } })
})
app.post('/api/auth/logout', requireAuth, (_request, response) => { response.status(204).end() })
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

// Slide management endpoints
app.post('/api/projects/:projectId/slides', requireAuth, (request, response) => {
  const project = projects.get(request.params.projectId)
  if (!project || project.ownerId !== request.userId) return response.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' })
  
  const { name, slide } = request.body ?? {}
  if (typeof name !== 'string' || !slide) return response.status(400).json({ message: '슬라이드 데이터가 올바르지 않습니다.' })
  
  if (!Array.isArray(project.document.slides)) project.document.slides = []
  project.document.slides.push(slide)
  project.updatedAt = new Date().toISOString()
  response.status(201).json(slide)
})

app.put('/api/projects/:projectId/slides/:slideId', requireAuth, (request, response) => {
  const project = projects.get(request.params.projectId)
  if (!project || project.ownerId !== request.userId) return response.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' })
  
  const { slideId } = request.params
  const { slide } = request.body ?? {}
  if (!slide) return response.status(400).json({ message: '슬라이드 데이터가 올바르지 않습니다.' })
  
  if (!Array.isArray(project.document.slides)) return response.status(404).json({ message: '슬라이드를 찾을 수 없습니다.' })
  
  const index = project.document.slides.findIndex(s => s.id === slideId)
  if (index === -1) return response.status(404).json({ message: '슬라이드를 찾을 수 없습니다.' })
  
  project.document.slides[index] = { ...project.document.slides[index], ...slide, updatedAt: new Date().toISOString() }
  project.updatedAt = new Date().toISOString()
  response.json(project.document.slides[index])
})

app.delete('/api/projects/:projectId/slides/:slideId', requireAuth, (request, response) => {
  const project = projects.get(request.params.projectId)
  if (!project || project.ownerId !== request.userId) return response.status(404).json({ message: '프로젝트를 찾을 수 없습니다.' })
  
  const { slideId } = request.params
  if (!Array.isArray(project.document.slides)) return response.status(404).json({ message: '슬라이드를 찾을 수 없습니다.' })
  
  const index = project.document.slides.findIndex(s => s.id === slideId)
  if (index === -1) return response.status(404).json({ message: '슬라이드를 찾을 수 없습니다.' })
  
  project.document.slides.splice(index, 1)
  project.updatedAt = new Date().toISOString()
  response.status(204).end()
})

app.listen(port, '0.0.0.0', () => console.log(`Wireframe Studio API listening on http://localhost:${port}`))
