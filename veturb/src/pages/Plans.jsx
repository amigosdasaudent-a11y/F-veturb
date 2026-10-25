import React, { useState } from 'react'
import { Icon } from '../lib/icons.jsx'
import { useApp } from '../lib/ctx.jsx'
import { update } from '../lib/db.js'
import { Btn, Modal, Badge, CopyBox } from '../components/ui.jsx'

const PLANS = [
  { id: 'start', name: 'Start', price: 97, desc: 'Para quem está começando com VSLs.', features: ['Até 5 players', '5.000 visualizações/mês', 'CTAs e cronômetro', 'Leads ilimitados', 'Embed responsivo'], limit: '5 players' },
  { id: 'pro', name: 'Pro', price: 197, desc: 'Para infoprodutores e afiliados.', popular: true, features: ['Players ilimitados', '50.000 visualizações/mês', 'Pixel + GTM + eventos', 'Simulação ao vivo', 'Anúncios em vídeo', 'Domínios permitidos'], limit: 'Ilimitado' },
  { id: 'agency', name: 'Agência', price: 497, desc: 'Para agências e múltiplos clientes.', features: ['Tudo do Pro', 'Multi-tenant / workspaces', '200.000 visualizações/mês', 'White label', 'Suporte prioritário', 'API de eventos'], limit: 'White label' },
]

export default function Plans() {
  const { db, showToast } = useApp()
  const [checkout, setCheckout] = useState(null)
  const [paid, setPaid] = useState(false)
  const [annual, setAnnual] = useState(false)
  const current = db.user.plan

  const price = p => annual ? Math.round(p.price * .8) : p.price
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136veturb-${checkout?.id || 'pro'}-202610252204000053039865802BR5921VETURB TECNOLOGIA6009SAO PAULO62070503***6304A1B2`

  const confirmPayment = () => {
    setPaid(true)
    update(s => ({ user: { ...s.user, plan: checkout.name } }))
    showToast(`Plano ${checkout.name} ativado! Liberação automática via Mercado Pago.`)
  }

  return (
    <div className="content">
      <div className="page-head">
        <div><h1>Planos e Assinaturas</h1><p>Escolha o plano ideal para escalar suas VSLs. Pagamento via PIX com liberação automática.</p></div>
        <div className="head-actions"><div className="seg-range"><button className={!annual ? 'active' : ''} onClick={() => setAnnual(false)}>Mensal</button><button className={annual ? 'active' : ''} onClick={() => setAnnual(true)}>Anual -20%</button></div></div>
      </div>

      <div className="current-plan"><Icon name="card" size={20} /><div><strong>Plano atual: {current}</strong><span>{current === 'Sem plano' ? 'Você está usando o acesso de demonstração. Assine para liberar todos os recursos.' : `Sua assinatura ${current} está ativa.`}</span></div><Badge tone={current === 'Sem plano' ? 'neutral' : 'green'}>{current === 'Sem plano' ? 'TRIAL' : 'ATIVO'}</Badge></div>

      <div className="plans-grid">
        {PLANS.map(pl => <div className={`plan-card ${pl.popular ? 'popular' : ''}`} key={pl.id}>
          {pl.popular && <span className="plan-popular">MAIS ESCOLHIDO</span>}
          <h3>{pl.name}</h3><p>{pl.desc}</p>
          <div className="plan-price"><small>R$</small><strong>{price(pl)}</strong><span>/mês</span></div>
          <div className="plan-limit"><Icon name="layers" size={14} /> {pl.limit}</div>
          <ul>{pl.features.map(f => <li key={f}><Icon name="check" size={15} />{f}</li>)}</ul>
          <Btn variant={pl.popular ? 'primary' : 'outline'} className="full" onClick={() => { setCheckout(pl); setPaid(false) }}>{current === pl.name ? 'Plano atual' : 'Assinar com PIX'}</Btn>
        </div>)}
      </div>

      <div className="card mp-card">
        <div className="mp-head"><span className="mp-logo">MP</span><div><strong>Mercado Pago</strong><span>Checkout transparente · PIX automático · Assinaturas recorrentes</span></div><Badge tone="green"><Icon name="check" size={12} /> Integrado</Badge></div>
        <div className="mp-steps">{[['qrcode','Gere o código PIX'],['bolt','Pague no seu banco'],['zap','Plano liberado na hora'],['refresh','Gestão de assinatura']].map(([i, t], n) => <div key={t}><span className="mp-step-num">{n + 1}</span><Icon name={i} size={17} /><span>{t}</span></div>)}</div>
      </div>

      <Modal open={!!checkout} onClose={() => setCheckout(null)} title={paid ? 'Pagamento aprovado!' : `Assinar plano ${checkout?.name}`} subtitle={paid ? 'Seu plano foi liberado automaticamente.' : 'Pague com PIX — liberação automática em segundos.'} width={560}
        footer={paid ? <Btn variant="primary" onClick={() => setCheckout(null)}>Começar a usar</Btn> : <><Btn variant="ghost" onClick={() => setCheckout(null)}>Cancelar</Btn><Btn variant="primary" icon="check" onClick={confirmPayment}>Simular pagamento PIX</Btn></>}>
        {paid ? <div className="paid-state"><span><Icon name="check" size={34} /></span><h3>Tudo pronto!</h3><p>O plano <strong>{checkout?.name}</strong> está ativo na sua conta. Todos os recursos foram liberados.</p></div> : checkout && <div className="checkout">
          <div className="checkout-summary"><div><span>Plano</span><strong>{checkout.name}</strong></div><div><span>Periodicidade</span><strong>{annual ? 'Anual' : 'Mensal'}</strong></div><div><span>Total</span><strong>R$ {price(checkout)},00</strong></div></div>
          <div className="pix-visual"><div className="pix-qr">{Array.from({ length: 121 }, (_, i) => <i key={i} className={((i * 7 + Math.floor(i / 11) * 3) % 5 < 2) ? 'on' : ''} />)}</div><div><strong>PIX Copia e Cola</strong><p>Escaneie o QR Code ou copie o código abaixo no aplicativo do seu banco.</p></div></div>
          <CopyBox value={pixCode} label="CÓDIGO PIX" hint="Em produção, este código é gerado pela API do Mercado Pago." />
          <div className="mini-info"><Icon name="info" size={14} /> Ambiente de demonstração: clique em “Simular pagamento PIX” para ativar o plano sem cobrança real.</div>
        </div>}
      </Modal>
    </div>
  )
}
