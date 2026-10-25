import React, { useEffect, useMemo, useState } from 'react'
import { Icon, Logo } from '../lib/icons.jsx'
import { useApp } from '../lib/ctx.jsx'
import { playerById, logEvent, addLead, incrementPlayer, defaultPlayer } from '../lib/db.js'
import PlayerEngine from '../components/PlayerEngine.jsx'

export default function PublicPlayer({ path }) {
  const { db, navigate, showToast } = useApp()
  const isEmbed = path.startsWith('/embed/')
  const rawId = path.split('?')[0].split('/')[2]
  const previewParam = path.includes('preview=1')
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [localLog, setLocalLog] = useState([])

  const player = useMemo(() => {
    if (rawId === 'preview') {
      try { const raw = localStorage.getItem('vt_draft_preview'); if (raw) return JSON.parse(raw) } catch {}
      return playerById(db, 'ply_vendas') || db.players[0] || defaultPlayer({ name: 'Player de demonstração' })
    }
    return playerById(db, rawId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId])

  useEffect(() => { document.title = player ? `${player.name} — vêTurb Player` : 'vêTurb Player' }, [player?.name])

  const handleEvent = (type, extra = {}) => {
    setLocalLog(l => [{ ts: Date.now(), type, ...extra }, ...l].slice(0, 30))
    if (!player || rawId === 'preview') return
    const gate = { view: 'pageView', play: 'play', progress: 'progress', cta: 'ctaClick', conversion: 'conversion' }[type]
    if (gate && player.tracking?.[gate] === false) return
    logEvent(player.id, type, extra)
    const field = { view: 'views', play: 'plays', cta: 'ctaClicks' }[type]
    if (field) incrementPlayer(player.id, field)
  }
  const handleLead = data => {
    if (!player || rawId === 'preview') { showToast('Lead capturado na pré-visualização (não salvo).'); return }
    addLead({ ...data, playerId: player.id })
    showToast('Lead capturado! Confira no menu Leads.')
  }

  if (!player) return (
    <div className="public-page"><div className="public-missing"><Icon name="alert" size={34} /><h2>Player não encontrado</h2><p>Verifique o link de incorporação ou crie um novo player no painel.</p><button onClick={() => navigate('/players')}>Ir para o painel</button></div></div>
  )

  const stage = (
    <div className={`public-stage ${player.orientation === 'vertical' ? 'is-vertical' : ''}`}>
      <PlayerEngine key={rawId} player={player} mode="public" previewParam={previewParam ? true : (rawId === 'preview')}
        onEvent={handleEvent} onLead={handleLead} />
    </div>
  )

  if (isEmbed) return <div className="embed-page">{stage}</div>

  return (
    <div className="public-page">
      <header className="public-topbar">
        <div className="public-brand"><Logo size={30} withText /><span className="public-tag">Rota de embed ultra rápida</span></div>
        <div className="public-actions">
          <button onClick={() => setConsoleOpen(v => !v)}><Icon name="code" size={15} /> Console de eventos {localLog.length > 0 && <b>{localLog.length}</b>}</button>
          <button onClick={() => navigate('/players')}><Icon name="arrowLeft" size={15} /> Voltar ao painel</button>
        </div>
      </header>
      <div className="public-body">
        <div className="public-center">
          <div className="public-title"><h1>{player.name || 'Player sem nome'}</h1><span><Icon name="bolt" size={13} /> Carregamento otimizado · sem scripts desnecessários</span></div>
          {stage}
          <div className="public-hints">
            <div><Icon name="playOutline" size={16} /><span><strong>Clique para ouvir</strong> — inicia o vídeo e dispara <code>PlayerPlay</code>.</span></div>
            <div><Icon name="target" size={16} /><span><strong>CTA cronometrado</strong> — clique gera <code>PlayerCtaClick</code>.</span></div>
            <div><Icon name="users" size={16} /><span><strong>Captura de leads</strong> — o formulário aparece no segundo configurado.</span></div>
            <div><Icon name="external" size={16} /><span><strong>Exit intent</strong> — mova o mouse para fora do topo da página.</span></div>
          </div>
        </div>
        {consoleOpen && <aside className="public-console">
          <div className="console-head"><Icon name="code" size={16} /><strong>Eventos em tempo real</strong><button onClick={() => setLocalLog([])}>Limpar</button></div>
          <p>Eventos enviados para o Facebook Pixel e para <code>window.dataLayer</code> (GTM).</p>
          <div className="console-list">{localLog.length === 0 ? <div className="console-empty">Interaja com o player para ver os eventos.</div> : localLog.map((e, i) => <div key={i} className="console-line"><span className={`log-dot ev-${e.type}`} /><time>{new Date(e.ts).toLocaleTimeString('pt-BR')}</time><code>{({ view: 'PageView', play: 'PlayerPlay', progress: 'PlayerProgress', cta: 'PlayerCtaClick', conversion: 'PlayerLead' })[e.type]}</code>{typeof e.pct === 'number' && <small>{e.pct}%</small>}</div>)}</div>
          <div className="console-foot"><div><span>Pixel ID</span><strong>{player.tracking.pixel || 'não configurado'}</strong></div><div><span>GTM ID</span><strong>{player.tracking.gtm || 'não configurado'}</strong></div></div>
        </aside>}
      </div>
    </div>
  )
}
