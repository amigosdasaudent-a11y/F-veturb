import { useSyncExternalStore } from 'react'

const KEY = 'veturb_db_v1'

export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}`
export const fmt = n => new Intl.NumberFormat('pt-BR').format(n || 0)
export const pct = n => `${(n || 0).toFixed(1).replace('.', ',')}%`
export const fmtDate = d => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
export const fmtDateTime = d => new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
export const dayKey = d => new Date(d).toISOString().slice(0, 10)
export const secToTime = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function embedBase() {
  const configured = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_EMBED_BASE_URL) || ''
  if (configured) return String(configured).replace(/\/$/, '')
  if (typeof window === 'undefined') return ''
  return (window.location.origin + window.location.pathname).replace(/\/$/, '')
}

export function youtubeId(url = '') {
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export function defaultPlayer(over = {}) {
  return {
    id: uid('ply'),
    workspaceId: 'ws_odonto',
    name: '',
    videoUrl: '',
    videoType: 'youtube',
    orientation: 'horizontal',
    status: 'active',
    createdAt: Date.now(),
    views: 0, plays: 0, ctaClicks: 0, conversions: 0,
    appearance: { accent: '#7440B6', controls: '#7440B6', bg: '#4a2a7a', text: '#ffffff' },
    controls: { quality: true, seek5: true, fullscreen: true, timecode: true, progress: true },
    fakeProgress: { enabled: true, speed: 2, thickness: 4 },
    playPause: { type: 'svg', color: '#7440B6', scale: 1, pauseModal: true, overlay: 'default', modalTitle: 'Continue de onde parou?', modalText: 'Você já assistiu parte deste vídeo. Deseja continuar?' },
    cta: {
      enabled: true, type: 'button', text: 'Clique Aqui', icon: 'none', color: '#7440B6', textColor: '#ffffff',
      url: 'https://meusite.com.br/comprar', time: 0, position: 'top', size: 'md', radius: 'lg',
      animation: 'pulse', customImage: '',
    },
    countdown: { enabled: true, duration: 600, appearAfter: 0, text: 'Oferta expira em', position: 'tr', onExpire: 'hide', theme: 'red', bg: '#dc2626', textColor: '#ffffff', size: 'md' },
    live: { enabled: true, label: 'LIVE', min: 500, max: 3000, realVisitors: false, position: 'tr', theme: 'red', bg: '#dc2626', textColor: '#ffffff', blink: '#fef444' },
    ads: [],
    exitIntent: { enabled: true, title: 'Espere! Não vá embora', text: 'Você está prestes a perder uma oportunidade única.', buttonText: 'Quero aproveitar', buttonUrl: '#', once: true, bg: '#111631', buttonBg: '#6c5ce7', buttonTextColor: '#ffffff' },
    lead: { enabled: true, at: 10, buttonText: 'Continuar assistindo', title: 'Receba acesso exclusivo', subtitle: 'Preencha para continuar assistindo', bg: '#2a2a2a', buttonBg: '#7440B6' },
    tracking: { pixel: '', gtm: '', pageView: true, play: true, progress: true, ctaClick: true },
    domains: { allowed: '', blockDevTools: true },
    ...over,
  }
}

function seededRandom(seed) {
  let s = seed
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646 }
}

function seed() {
  const players = [
    defaultPlayer({
      id: 'ply_vendas', name: 'Player Página de Vendas', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      views: 12840, plays: 9214, ctaClicks: 1836, conversions: 412, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 26,
      cta: { ...defaultPlayer().cta, text: 'GARANTIR MINHA VAGA', time: 8, animation: 'pulse', icon: 'zap' },
      countdown: { ...defaultPlayer().countdown, duration: 900 },
      lead: { ...defaultPlayer().lead, enabled: false, at: 60 },
      tracking: { pixel: '123456789012345', gtm: 'GTM-ABC1234', pageView: true, play: true, progress: true, ctaClick: true },
    }),
    defaultPlayer({
      id: 'ply_odonto', name: 'VSL Odonto Care — Principal', videoUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      views: 6420, plays: 4188, ctaClicks: 822, conversions: 187, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 14,
      appearance: { accent: '#0e9f6e', controls: '#0e9f6e', bg: '#123c3a', text: '#ffffff' },
      cta: { ...defaultPlayer().cta, text: 'AGENDAR AVALIAÇÃO', color: '#0e9f6e', time: 6, animation: 'heartbeat', icon: 'check' },
      countdown: { ...defaultPlayer().countdown, enabled: false },
      live: { ...defaultPlayer().live, enabled: false },
      lead: { ...defaultPlayer().lead, at: 12 },
    }),
    defaultPlayer({
      id: 'ply_shorts', name: 'Shorts Vertical — Oferta Relâmpago', videoUrl: '',
      views: 3180, plays: 2410, ctaClicks: 490, conversions: 96, createdAt: Date.now() - 1000 * 60 * 60 * 24 * 6,
      orientation: 'vertical', appearance: { accent: '#e11d48', controls: '#e11d48', bg: '#4c1030', text: '#ffffff' },
      cta: { ...defaultPlayer().cta, text: 'QUERO O DESCONTO', color: '#e11d48', time: 3, position: 'bottom', animation: 'bounce' },
      countdown: { ...defaultPlayer().countdown, duration: 300, bg: '#be123c' },
      live: { ...defaultPlayer().live, min: 100, max: 900 },
      lead: { ...defaultPlayer().lead, enabled: false },
    }),
  ]
  players[2].workspaceId = 'ws_demo'

  const leads = [
    { id: uid('ld'), playerId: 'ply_vendas', name: 'Mariana Souza', email: 'mariana.souza@email.com', whatsapp: '(21) 98877-6655', createdAt: Date.now() - 1000 * 60 * 60 * 5 },
    { id: uid('ld'), playerId: 'ply_vendas', name: 'Rafael Lima', email: 'rafael.lima@empresa.com.br', whatsapp: '(11) 99765-4321', createdAt: Date.now() - 1000 * 60 * 60 * 28 },
    { id: uid('ld'), playerId: 'ply_odonto', name: 'Camila Ferreira', email: 'camila.ferreira@gmail.com', whatsapp: '(21) 98123-4455', createdAt: Date.now() - 1000 * 60 * 60 * 52 },
    { id: uid('ld'), playerId: 'ply_odonto', name: 'Bruno Almeida', email: 'bruno.almeida@outlook.com', whatsapp: '(31) 99112-3344', createdAt: Date.now() - 1000 * 60 * 60 * 80 },
  ]

  // Histórico de eventos (14 dias) para gráficos e retenção
  const rnd = seededRandom(20261025)
  const events = []
  const now = Date.now()
  const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0)
  const randTs = d => {
    const dayStart = startOfToday.getTime() - d * 864e5
    const span = d === 0 ? Math.max(now - dayStart, 6e5) : 864e5
    return dayStart + Math.round(rnd() * span * .96)
  }
  for (let d = 13; d >= 0; d--) {
    const fatorDia = d === 0 ? Math.max(.25, (now - startOfToday.getTime()) / 864e5) : 1
    const push = (playerId, type, total, cap, extra = {}) => {
      const c = Math.min(Math.max(total, 0), cap)
      if (!c) return
      const n = Math.ceil(total / c)
      for (let i = 0; i < c; i++) events.push({ ts: randTs(d), playerId, type, n, ...extra })
    }
    for (let p = 0; p < players.length; p++) {
      const pid = players[p].id
      const weight = [1, .55, .3][p]
      const tendencia = 1 + (13 - d) * .045
      const sazonalidade = .62 + rnd() * .75
      const views = Math.round((180 + rnd() * 320) * weight * tendencia * sazonalidade * fatorDia)
      const plays = Math.round(views * (.55 + rnd() * .22))
      const ctas = Math.round(plays * (.09 + rnd() * .07))
      const conv = Math.round(ctas * (.18 + rnd() * .14))
      push(pid, 'view', views, 14)
      push(pid, 'play', plays, 12)
      for (let i = 0; i < Math.min(Math.round(plays * .9), 26); i++) events.push({ ts: randTs(d), playerId: pid, type: 'progress', pct: Math.round((rnd() ** .72) * 100) })
      push(pid, 'cta', ctas, 9)
      push(pid, 'conversion', conv, 6)
    }
  }
  return {
    workspaces: [
      { id: 'ws_odonto', name: 'Odonto Care', role: 'MEMBRO', initials: 'OC' },
      { id: 'ws_demo', name: 'Demo VSL', role: 'ADMIN', initials: 'DV' },
    ],
    activeWorkspace: 'ws_odonto',
    user: { name: 'João Vitor', email: 'joao@veturb.com.br', plan: 'Sem plano', twoFA: false, recoveryCodes: [], company: 'vêTurb Studio' },
    session: null, // null => tela de login
    players, leads, events,
    notifications: [
      { id: uid('nt'), title: 'Novo lead capturado', text: 'Mariana Souza preencheu o formulário do player principal.', ts: Date.now() - 1000 * 60 * 60 * 5, read: false },
      { id: uid('nt'), title: 'Meta de conversão batida', text: 'Player Página de Vendas atingiu 400 conversões.', ts: Date.now() - 1000 * 60 * 60 * 24, read: false },
    ],
  }
}

let state
try {
  const raw = localStorage.getItem(KEY)
  state = raw ? JSON.parse(raw) : seed()
} catch { state = seed() }

const listeners = new Set()
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* quota */ }
  listeners.forEach(l => l())
}
export function getState() { return state }
export function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn) }
export function useDB() { return useSyncExternalStore(subscribe, getState, getState) }

export function update(fnOrPatch) {
  const next = typeof fnOrPatch === 'function' ? fnOrPatch(state) : fnOrPatch
  state = next ? { ...state, ...next } : state
  persist()
  return state
}

// ---- API de domínio ----
export const playersOf = (s, wid) => s.players.filter(p => p.workspaceId === wid)
export const playerById = (s, id) => s.players.find(p => p.id === id)
export const leadsOf = (s, wid) => {
  const ids = new Set(playersOf(s, wid).map(p => p.id))
  return s.leads.filter(l => ids.has(l.playerId))
}
export const eventsOf = (s, wid) => {
  const ids = new Set(playersOf(s, wid).map(p => p.id))
  return s.events.filter(e => ids.has(e.playerId))
}

export function savePlayer(player) {
  update(s => {
    const exists = s.players.some(p => p.id === player.id)
    return { players: exists ? s.players.map(p => p.id === player.id ? player : p) : [player, ...s.players] }
  })
}

export function deletePlayer(id) {
  update(s => ({ players: s.players.filter(p => p.id !== id) }))
}

export function duplicatePlayer(id) {
  update(s => {
    const p = playerById(s, id)
    if (!p) return {}
    const copy = { ...structuredClone(p), id: uid('ply'), name: `${p.name} (cópia)`, createdAt: Date.now(), views: 0, plays: 0, ctaClicks: 0, conversions: 0 }
    return { players: [copy, ...s.players] }
  })
}

export function addLead(lead) {
  const l = { id: uid('ld'), createdAt: Date.now(), ...lead }
  update(s => ({ leads: [l, ...s.leads] }))
  logEvent(lead.playerId, 'conversion')
  incrementPlayer(lead.playerId, 'conversions')
  return l
}

export function logEvent(playerId, type, extra = {}) {
  const e = { ts: Date.now(), playerId, type, ...extra }
  update(s => {
    const events = [...s.events, e]
    return { events: events.length > 6000 ? events.slice(-5000) : events }
  })
  // Integrações reais (quando o script do Pixel/GTM estiver presente na página)
  try {
    const p = playerById(getState(), playerId)
    const map = { view: 'PageView', play: 'PlayerPlay', progress: 'PlayerProgress', cta: 'PlayerCtaClick', conversion: 'PlayerLead' }
    if (p?.tracking?.pixel && typeof window.fbq === 'function') window.fbq('trackCustom', map[type] || type, { player_id: playerId, ...extra })
    if (p?.tracking?.gtm) {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({ event: { view: 'page_view', play: 'player_play', progress: 'player_progress', cta: 'player_cta_click', conversion: 'player_lead' }[type] || type, player_id: playerId, ...extra })
    }
  } catch { /* ambiente sem os scripts */ }
  return e
}

export function incrementPlayer(id, field) {
  update(s => ({ players: s.players.map(p => p.id === id ? { ...p, [field]: (p[field] || 0) + 1 } : p) }))
}

export function resetDemo() { state = seed(); persist() }

export function aggregate(events, days = 14) {
  const out = []
  const today = new Date(); today.setHours(0, 0, 0, 0)
  for (let d = days - 1; d >= 0; d--) {
    const start = today.getTime() - d * 864e5
    const end = start + 864e5
    const evs = events.filter(e => e.ts >= start && e.ts < end)
    const count = t => evs.filter(e => e.type === t).reduce((a, e) => a + (e.n || 1), 0)
    out.push({
      date: new Date(start), label: new Date(start).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      views: count('view'), plays: count('play'), cta: count('cta'), conversions: count('conversion'), progress: count('progress'),
    })
  }
  return out
}

export function retentionCurve(events) {
  const buckets = Array.from({ length: 10 }, () => 0)
  const prog = events.filter(e => e.type === 'progress' && typeof e.pct === 'number')
  if (!prog.length) return buckets.map(() => 0)
  prog.forEach(e => { const i = Math.min(9, Math.floor(e.pct / 10)); buckets[i]++ })
  return buckets.map(v => Math.round((v / prog.length) * 100))
}

export function retentionRate(events) {
  const prog = events.filter(e => e.type === 'progress' && typeof e.pct === 'number')
  if (!prog.length) return 0
  return prog.reduce((a, b) => a + b.pct, 0) / prog.length
}
