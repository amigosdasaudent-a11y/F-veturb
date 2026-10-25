import React, { useState } from 'react'
import { Icon, Logo } from '../lib/icons.jsx'
import { useApp } from '../lib/ctx.jsx'
import { getState, update } from '../lib/db.js'
import { getCloudState, setCloudReady, syncCloudState, supabase, supabaseConfigured } from '../lib/supabase.js'
import { Btn, Field, Input, Toggle } from '../components/ui.jsx'

export default function Auth() {
  const { db, navigate, showToast } = useApp()
  const [mode, setMode] = useState('login') // login | signup | 2fa | recovery
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [code, setCode] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const demoCode = String(100000 + (Math.floor(Date.now() / 30000) % 899999))

  const doLogin = async e => {
    e?.preventDefault()
    const minPassword = supabaseConfigured ? 6 : 4
    if (!form.email.includes('@') || form.password.length < minPassword) { setErr(`Informe um e-mail válido e uma senha com ${minPassword}+ caracteres.`); return }
    setErr('')
    if (supabaseConfigured) {
      setBusy(true)
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
        if (error) throw error
        const remote = await getCloudState()
        const session = { id: data.user.id, email: data.user.email, since: Date.now() }
        if (remote) update({ ...remote, session, user: { ...remote.user, email: data.user.email } })
        else update({ session, user: { ...db.user, email: data.user.email } })
        setCloudReady(true)
        if (!remote) await syncCloudState(getState())
        showToast('Acesso seguro realizado.')
        navigate('/dashboard')
      } catch (error) { setErr(error.message || 'Não foi possível entrar. Confira e-mail e senha.') }
      finally { setBusy(false) }
      return
    }
    if (db.user.twoFA) { setErr(''); setMode('2fa'); return }
    update(s => ({ session: { email: form.email, since: Date.now() }, user: { ...s.user, email: form.email || s.user.email } }))
    showToast('Bem-vindo ao vêTurb!')
    navigate('/dashboard')
  }
  const doSignup = async e => {
    e.preventDefault()
    const minPassword = supabaseConfigured ? 6 : 4
    if (!form.name.trim() || !form.email.includes('@') || form.password.length < minPassword) { setErr(`Preencha nome, e-mail e senha (${minPassword}+ caracteres).`); return }
    setErr('')
    if (supabaseConfigured) {
      setBusy(true)
      try {
        const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { full_name: form.name }, emailRedirectTo: window.location.origin + window.location.pathname } })
        if (error) throw error
        if (!data.session) {
          showToast('Conta criada. Confirme o e-mail e depois faça login.')
          setMode('login')
          return
        }
        const session = { id: data.user.id, email: data.user.email, since: Date.now() }
        update({ session, user: { ...db.user, name: form.name, email: data.user.email } })
        setCloudReady(true)
        await syncCloudState(getState())
        showToast('Conta criada e conectada ao banco de dados.')
        navigate('/dashboard')
      } catch (error) { setErr(error.message || 'Não foi possível criar a conta.') }
      finally { setBusy(false) }
      return
    }
    update(s => ({ session: { email: form.email, since: Date.now() }, user: { ...s.user, name: form.name, email: form.email } }))
    showToast('Conta criada! Seu trial de 14 dias começou.')
    navigate('/dashboard')
  }
  const do2FA = e => {
    e.preventDefault()
    const ok = code === demoCode || (db.user.recoveryCodes || []).includes(code)
    if (!ok) { setErr('Código inválido. Use o código do autenticador abaixo.'); return }
    update({ session: { email: form.email, since: Date.now() } })
    showToast('Autenticação em dois fatores concluída.')
    navigate('/dashboard')
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-brand"><Logo size={38} withText /></div>
        <div className="auth-hero">
          <span className="auth-kicker"><Icon name="sparkle" size={14} /> PLATAFORMA DE VSLs</span>
          <h1>Transforme vídeos em<br /><em>máquinas de vendas.</em></h1>
          <p>Players inteligentes, CTAs cronometrados, rastreamento avançado e métricas de retenção em uma única plataforma.</p>
          <div className="auth-features">
            {[['zap','Rota de embed ultra rápida'], ['target','CTAs no momento exato'], ['chart','Retenção em tempo real'], ['shield','2FA e domínios permitidos']].map(([i, t]) => <div key={t}><span><Icon name={i} size={16} /></span>{t}</div>)}
          </div>
        </div>
        <div className="auth-foot">© 2026 vêTurb · React 19 + Vite · SaaS multi-tenant</div>
      </div>
      <div className="auth-right">
        <div className="auth-form-wrap">
          {mode === 'login' && <>
            <h2>Entrar na sua conta</h2>
            <p className="auth-sub">Acesse seu painel para gerenciar players e leads.</p>
            <form onSubmit={doLogin}>
              <Field label="E-mail"><Input value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="voce@empresa.com" type="email" /></Field>
              <Field label="Senha"><Input value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder="••••••••" type="password" /></Field>
              <div className="auth-row"><label className="checkline"><input type="checkbox" defaultChecked /> Manter conectado</label><button type="button" className="link-btn" onClick={() => showToast('Link de recuperação enviado (demonstração).')}>Esqueci minha senha</button></div>
              {err && <div className="form-error"><Icon name="alert" size={14} />{err}</div>}
              <Btn type="submit" variant="primary" className="full" iconRight="arrowRight" disabled={busy}>{busy ? 'Conectando…' : 'Entrar'}</Btn>
            </form>
            <div className="auth-demo"><Icon name="info" size={15} /><span>{supabaseConfigured ? <><strong>Login protegido:</strong> use o e-mail e a senha cadastrados no Supabase.</> : <><strong>Acesso de demonstração:</strong> qualquer e-mail e senha com 4+ caracteres. Ex.: <code>joao@veturb.com.br</code> / <code>1234</code></>}</span></div>
            <div className="auth-switch">Ainda não tem conta? <button onClick={() => { setMode('signup'); setErr('') }}>Criar conta grátis</button></div>
          </>}

          {mode === 'signup' && <>
            <h2>Crie sua conta</h2>
            <p className="auth-sub">14 dias grátis. Sem cartão de crédito.</p>
            <form onSubmit={doSignup}>
              <Field label="Nome completo"><Input value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="Seu nome" /></Field>
              <Field label="E-mail"><Input value={form.email} onChange={v => setForm({ ...form, email: v })} placeholder="voce@empresa.com" type="email" /></Field>
              <Field label="Senha"><Input value={form.password} onChange={v => setForm({ ...form, password: v })} placeholder={`Mínimo ${supabaseConfigured ? 6 : 4} caracteres`} type="password" /></Field>
              {err && <div className="form-error"><Icon name="alert" size={14} />{err}</div>}
              <Btn type="submit" variant="primary" className="full" iconRight="arrowRight" disabled={busy}>{busy ? 'Criando conta…' : 'Criar conta'}</Btn>
            </form>
            <div className="auth-switch">Já tem conta? <button onClick={() => { setMode('login'); setErr('') }}>Entrar</button></div>
          </>}

          {mode === '2fa' && <>
            <span className="auth-2fa-icon"><Icon name="shield" size={28} /></span>
            <h2>Verificação em dois fatores</h2>
            <p className="auth-sub">Digite o código de 6 dígitos do seu app autenticador (Google Authenticator ou Authy).</p>
            <form onSubmit={do2FA}>
              <Field label="Código de verificação"><Input value={code} onChange={v => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" className="code-input" /></Field>
              {err && <div className="form-error"><Icon name="alert" size={14} />{err}</div>}
              <div className="auth-demo"><Icon name="info" size={15} /><span>Código demo deste minuto: <strong>{demoCode}</strong></span></div>
              <Btn type="submit" variant="primary" className="full" iconRight="arrowRight">Verificar e entrar</Btn>
            </form>
            <div className="auth-switch"><button onClick={() => setMode('recovery')}>Usar código de recuperação</button> · <button onClick={() => { setMode('login'); setErr('') }}>Voltar</button></div>
          </>}

          {mode === 'recovery' && <>
            <span className="auth-2fa-icon"><Icon name="key" size={28} /></span>
            <h2>Código de recuperação</h2>
            <p className="auth-sub">Use um dos códigos salvos ao ativar o 2FA.</p>
            <Field label="Código de recuperação"><Input value={code} onChange={v => setCode(v.toUpperCase())} placeholder="XXXX-XXXX" /></Field>
            {err && <div className="form-error"><Icon name="alert" size={14} />{err}</div>}
            <Btn variant="primary" className="full" onClick={do2FA}>Validar código</Btn>
            <div className="auth-switch"><button onClick={() => { setMode('2fa'); setErr('') }}>Voltar ao autenticador</button></div>
          </>}
        </div>
      </div>
    </div>
  )
}
