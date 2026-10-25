import React, { useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { useApp } from '../lib/ctx.jsx'
import { update, uid, fmtDateTime } from '../lib/db.js'
import { Btn, Field, Input, Toggle, Modal, Badge, CopyBox } from '../components/ui.jsx'

function genSecret() { return Array.from({ length: 16 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'[Math.floor(Math.random() * 32)]).join('') }
function genCodes() { return Array.from({ length: 6 }, () => `${uid('').slice(1, 5).toUpperCase()}-${uid('').slice(1, 5).toUpperCase()}`) }

export default function Profile() {
  const { db, showToast } = useApp()
  const u = db.user
  const [name, setName] = useState(u.name)
  const [email, setEmail] = useState(u.email)
  const [company, setCompany] = useState(u.company || '')
  const [pass, setPass] = useState({ current: '', next: '', confirm: '' })
  const [setup, setSetup] = useState(false)
  const [secret, setSecret] = useState('')
  const [codes, setCodes] = useState([])
  const [verify, setVerify] = useState('')
  const [err, setErr] = useState('')
  const demoCode = String(100000 + (Math.floor(Date.now() / 30000) % 899999))

  const start2FA = () => { setSecret(genSecret()); setCodes(genCodes()); setSetup(true); setVerify(''); setErr('') }
  const confirm2FA = () => {
    if (verify !== demoCode) { setErr(`Código incorreto. Use o código demo ${demoCode}.`); return }
    update(s => ({ user: { ...s.user, twoFA: true, recoveryCodes: codes } }))
    setSetup(false); showToast('2FA ativado com sucesso!')
  }
  const disable2FA = () => { update(s => ({ user: { ...s.user, twoFA: false, recoveryCodes: [] } })); showToast('2FA desativado') }

  return (
    <div className="content">
      <div className="page-head"><div><h1>Meu perfil</h1><p>Gerencie seus dados, senha e segurança da conta.</p></div></div>

      <div className="profile-grid">
        <div className="card profile-card">
          <div className="profile-hero"><span className="profile-avatar">{(u.name || 'U').slice(0, 2).toUpperCase()}</span><div><h2>{u.name}</h2><p>{u.email}</p><Badge tone={u.plan === 'Sem plano' ? 'neutral' : 'green'}>{u.plan === 'Sem plano' ? 'SEM PLANO' : u.plan.toUpperCase()}</Badge></div></div>
          <div className="profile-meta"><div><Icon name="calendar" size={15} /><span>Membro desde {fmtDateTime(db.session?.since || Date.now() - 864e5 * 30).split(',')[0]}</span></div><div><Icon name="layers" size={15} /><span>{db.workspaces.length} workspaces</span></div><div><Icon name="playOutline" size={15} /><span>{db.players.length} players criados</span></div></div>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>Dados pessoais</h3><p>Informações da sua conta</p></div><Icon name="user" size={18} className="muted" /></div>
          <Field label="Nome completo"><Input value={name} onChange={setName} /></Field>
          <div className="field-row"><Field label="E-mail"><Input value={email} onChange={setEmail} type="email" /></Field><Field label="Empresa"><Input value={company} onChange={setCompany} /></Field></div>
          <Btn variant="primary" icon="save" onClick={() => { update(s => ({ user: { ...s.user, name, email, company } })); showToast('Perfil atualizado') }}>Salvar alterações</Btn>
        </div>

        <div className="card">
          <div className="card-head"><div><h3>Alterar senha</h3><p>Use uma senha forte e única</p></div><Icon name="lock" size={18} className="muted" /></div>
          <Field label="Senha atual"><Input type="password" value={pass.current} onChange={v => setPass({ ...pass, current: v })} placeholder="••••••••" /></Field>
          <div className="field-row"><Field label="Nova senha"><Input type="password" value={pass.next} onChange={v => setPass({ ...pass, next: v })} placeholder="••••••••" /></Field><Field label="Confirmar nova senha"><Input type="password" value={pass.confirm} onChange={v => setPass({ ...pass, confirm: v })} placeholder="••••••••" /></Field></div>
          <Btn variant="outline" icon="key" onClick={() => { if (pass.next.length < 4 || pass.next !== pass.confirm) { showToast('As senhas não conferem (mínimo 4 caracteres).', 'error'); return } setPass({ current: '', next: '', confirm: '' }); showToast('Senha alterada com sucesso') }}>Alterar senha</Btn>
        </div>

        <div className="card security-card">
          <div className="card-head"><div><h3>Autenticação em dois fatores (2FA)</h3><p>Proteção adicional com Google Authenticator ou Authy</p></div><Badge tone={u.twoFA ? 'green' : 'neutral'}>{u.twoFA ? 'ATIVO' : 'DESATIVADO'}</Badge></div>
          <div className="security-row"><span className="security-icon"><Icon name="shield" size={22} /></span><div><strong>{u.twoFA ? 'Sua conta está protegida' : 'Ative o 2FA agora'}</strong><p>{u.twoFA ? 'A cada login será solicitado um código de 6 dígitos do seu app autenticador.' : 'Adicione uma camada extra de segurança. Compatível com Google Authenticator, Authy e códigos de recuperação.'}</p></div></div>
          {u.twoFA ? <div className="twofa-on"><div className="twofa-actions"><Btn variant="outline" icon="key" onClick={() => setSetup(true)}>Ver códigos de recuperação</Btn><Btn variant="ghost" onClick={disable2FA}>Desativar 2FA</Btn></div>{u.recoveryCodes?.length > 0 && <div className="recovery-list">{u.recoveryCodes.map(c => <code key={c}>{c}</code>)}</div>}</div>
            : <Btn variant="primary" icon="shield" onClick={start2FA}>Configurar 2FA</Btn>}
        </div>
      </div>

      <div className="card danger-zone"><div><h3>Encerrar sessão</h3><p>Saia da conta neste dispositivo.</p></div><Btn variant="outline" icon="logout" onClick={() => update({ session: null })}>Sair da conta</Btn></div>

      <Modal open={setup} onClose={() => setSetup(false)} title={u.twoFA ? 'Códigos de recuperação' : 'Configurar autenticação em dois fatores'} subtitle="Escaneie o QR Code no Google Authenticator ou Authy." width={540}
        footer={u.twoFA ? <Btn variant="primary" onClick={() => setSetup(false)}>Concluir</Btn> : <><Btn variant="ghost" onClick={() => setSetup(false)}>Cancelar</Btn><Btn variant="primary" icon="check" onClick={confirm2FA}>Verificar e ativar</Btn></>}>
        <div className="twofa-setup">
          <div className="twofa-qr">{Array.from({ length: 169 }, (_, i) => <i key={i} className={((i * 11 + Math.floor(i / 13) * 5) % 7 < 3) ? 'on' : ''} />)}</div>
          <div className="twofa-copy"><h4>1. Escaneie ou digite a chave</h4><CopyBox label="CHAVE SECRETA" value={secret || db.user.twoFASecret || 'JBSWY3DPEHPK3PXP'} />
            <h4>2. Códigos de recuperação</h4><p>Guarde estes códigos em um local seguro. Cada um pode ser usado uma vez.</p>
            <div className="recovery-list">{(codes.length ? codes : u.recoveryCodes || []).map(c => <code key={c}>{c}</code>)}</div>
          </div>
          {!u.twoFA && <><Field label="3. Digite o código de 6 dígitos do app"><Input value={verify} onChange={v => { setVerify(v.replace(/\D/g, '').slice(0, 6)); setErr('') }} placeholder="000000" /></Field>
            <div className="mini-info"><Icon name="info" size={14} /> Nesta demonstração, use o código <strong>{demoCode}</strong> (muda a cada 30 segundos).</div>
            {err && <div className="form-error"><Icon name="alert" size={14} />{err}</div>}</>}
        </div>
      </Modal>
    </div>
  )
}
