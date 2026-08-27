import { useState, type FormEvent } from 'react'
import { api } from '../utils/api'

export function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [id, setId] = useState('super'); const [password, setPassword] = useState('1234'); const [error, setError] = useState('')
  const submit = async (event: FormEvent) => { event.preventDefault(); setError(''); try { const result = await api.login(id, password); localStorage.setItem('wireframe-token', result.token); onLogin() } catch (reason) { setError(reason instanceof Error ? reason.message : '로그인에 실패했습니다.') } }
  return <main className="auth-screen"><form className="auth-card" onSubmit={submit}><span className="brand-mark">W</span><span className="eyebrow">WIRE / FRAME</span><h1>Wireframe Studio</h1><p>내 프로젝트에 로그인하세요.</p><label>아이디<input value={id} onChange={(event) => setId(event.target.value)} autoComplete="username" /></label><label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <div className="auth-error">{error}</div>}<button className="auth-submit" type="submit">로그인</button><small>내부 테스트 계정 · super / 1234</small></form></main>
}
