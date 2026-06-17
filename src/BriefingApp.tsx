import { useState } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import bastelliLogo from '@/assets/bastelli-logo.png'

const ORANGE = '#d47241'
const BLUE = '#3e679f'
const DARK = '#2e3b4b'
const FONT = "'Onest', system-ui, sans-serif"

type Form = Record<string, any>

type BaseField = { key: string; label: string; hint?: string; required?: boolean }
type Field =
  | (BaseField & { type: 'text' | 'textarea' | 'email' | 'whatsapp' })
  | (BaseField & { type: 'radio'; options: string[]; multi?: boolean })

type Step = { title: string; section: string; fields: Field[] }

const SOCIAIS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Youtube', 'Outro',]
const FORM_FIELDS = ['Nome', 'E-mail', 'WhatsApp', 'Cidade', 'Serviço de interesse', 'Mensagem', 'Todos acima', 'Outro']

const steps: Step[] = [
  {
    title: 'Sobre o seu negócio',
    section: '1. Negócio',
    fields: [
      { key: 'nome', label: 'Nome da empresa ou profissional', type: 'text', hint: 'Como você quer ser chamado na página', required: true },
      { key: 'oferta', label: 'O que você vende ou oferece?', type: 'textarea', hint: 'Produto, serviço, curso... descreva com suas palavras', required: true },
      { key: 'objetivo', label: 'O que você quer que as pessoas façam na página?', type: 'radio', options: ['Entrar em contato', 'Comprar diretamente', 'Agendar atendimento', 'Pedir orçamento', 'Outro'], required: true },
      { key: 'site_tem', label: 'Já tem site?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'redes', label: 'Redes sociais', type: 'radio', multi: true, options: SOCIAIS, required: true },
    ],
  },
  {
    title: 'Quem é o seu cliente?',
    section: '2. Cliente',
    fields: [
      { key: 'publico', label: 'Como é a pessoa que você quer alcançar?', type: 'textarea', hint: 'Idade, se é homem/mulher/ambos, o que faz na vida', required: true },
      { key: 'regiao', label: 'Onde essa pessoa mora?', type: 'text', hint: 'Ex: São Paulo, Brasil todo, online', required: true },
      { key: 'b2', label: 'Vende para', type: 'radio', options: ['Pessoa física', 'Empresas', 'Ambos'], required: true },
      { key: 'dor', label: 'Qual é o maior problema que você resolve?', type: 'textarea', required: true },
      { key: 'desejo', label: 'O que seu cliente sonha em conquistar?', type: 'textarea', required: true },
      { key: 'objecao', label: 'O que pode fazer a pessoa hesitar antes de entrar em contato?', type: 'textarea', hint: 'Ex: preço, dúvida se funciona, medo de não ser para ela', required: true },
    ],
  },
  {
    title: 'O que você oferece',
    section: '3. Oferta',
    fields: [
      { key: 'detalhe_oferta', label: 'Descreva sua oferta com detalhes', type: 'textarea', hint: 'O que está incluso, como funciona, quanto tempo dura', required: true },
      { key: 'diferencial', label: 'Por que você é diferente dos concorrentes?', type: 'textarea', required: true },
      { key: 'resultado', label: 'Qual resultado concreto o cliente pode esperar?', type: 'textarea', hint: 'Ex: Em 30 dias você vai conseguir...', required: true },
      { key: 'garantia', label: 'Tem garantia, bônus ou vantagem especial?', type: 'textarea', required: true },
      { key: 'preco_mostrar', label: 'Quer mostrar o preço na página?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'preco', label: 'Preço ou condição comercial', type: 'text', hint: 'Ex: R$ 497 ou 3x de R$ 197', required: true },
    ],
  },
  {
    title: 'Como o cliente vai entrar em contato?',
    section: '4. Contato',
    fields: [
      { key: 'whatsapp', label: 'Número de WhatsApp', type: 'whatsapp', hint: 'Apenas números, com DDD (11 dígitos)', required: true },
      { key: 'email', label: 'E-mail de contato', type: 'email', hint: 'Ex: contato@suaempresa.com', required: true },
      { key: 'cta', label: 'Texto do botão principal', type: 'text', hint: 'O que vai aparecer escrito no botão — Ex: Falar no WhatsApp', required: true },
      { key: 'form', label: 'Quer formulário na página?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'msg_wa', label: 'Mensagem pré-preenchida no WhatsApp', type: 'textarea', hint: 'Texto que aparece automaticamente quando a pessoa clica no botão', required: true },
    ],
  },
  {
    title: 'Fotos, vídeos e depoimentos',
    section: '5. Materiais',
    fields: [
      { key: 'fotos', label: 'Tem fotos da empresa, produto ou equipe?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'videos', label: 'Tem vídeos?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'depoi', label: 'Tem depoimentos de clientes?', type: 'radio', options: ['Sim, em texto', 'Sim, em vídeo', 'Sim, print de WhatsApp/Google', 'Não tenho'], required: true },
    ],
  },
  {
    title: 'Como você quer que a página fique?',
    section: '6. Visual',
    fields: [
      { key: 'logo', label: 'Tem logotipo?', type: 'radio', options: ['Sim', 'Não'], required: true },
      { key: 'cores', label: 'Cores da marca', type: 'text', hint: "Código hex (#...) ou nome da cor: 'azul e dourado'", required: true },
      { key: 'estilo', label: 'Estilo visual desejado', type: 'radio', multi: true, options: ['Moderno', 'Minimalista', 'Elegante', 'Corporativo', 'Criativo', 'Popular'], required: true },
      { key: 'fundo', label: 'Prefere fundo', type: 'radio', options: ['Claro (branco/bege)', 'Escuro (preto/cinza)', 'Híbrido (mistura)'], required: true },
      { key: 'ref_visual', label: 'Link de site ou página que você acha bonito', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Jeito de escrever',
    section: '7. Textos',
    fields: [
      { key: 'tom', label: 'Como você quer que os textos soem?', type: 'radio', options: ['Formal e sério', 'Amigável e descontraído', 'Técnico e especialista', 'Emocional e inspirador', 'Direto e objetivo', 'Premium e sofisticado'], required: true },
      { key: 'slogan', label: 'Tem slogan ou frase que já usa?', type: 'text', required: true },
      { key: 'proibido', label: 'Tem palavra ou assunto que não pode aparecer?', type: 'textarea', required: true },
    ],
  },
  {
    title: 'Referências e informações extras',
    section: '8. Extras',
    fields: [
      { key: 'concorrentes', label: 'Sites de concorrentes', type: 'textarea', hint: 'Vamos analisar para te diferenciar — um link por linha', required: true },
      { key: 'inspiracao', label: 'Páginas que você achou interessantes', type: 'textarea', hint: 'Mesmo de outro segmento — cole os links', required: true },
      { key: 'extra', label: 'Informação adicional', type: 'textarea', hint: 'Qualquer coisa que não foi coberta acima', required: true },
      { key: 'contato_nome', label: 'Seu nome para contato', type: 'text', required: true },
    ],
  },
]

const BASTELLI_WA = import.meta.env.VITE_BASTELLI_WHATSAPP || '5519971142592'

export default function BriefingApp() {
  const [stepIdx, setStepIdx] = useState(0)
  const [form, setForm] = useState<Form>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  const totalSteps = steps.length
  const progress = done ? 100 : Math.round((stepIdx / totalSteps) * 100)
  const step = steps[stepIdx]

  const setValue = (key: string, val: any) => {
    setForm((f) => ({ ...f, [key]: val }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  const toggleMulti = (key: string, opt: string) => {
    const cur: string[] = (form[key] as string[]) || []
    setValue(key, cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt])
  }

  const toggleFormField = (opt: string) => {
    const cur: string[] = (form.form_fields as string[]) || []
    if (opt === 'Todos acima') {
      setValue('form_fields', cur.includes('Todos acima') ? [] : ['Todos acima'])
      return
    }
    if (cur.includes('Todos acima')) return
    setValue('form_fields', cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt])
  }

  const validateWhats = (v: string) => /^\d{11}$/.test(v.replace(/\D/g, ''))
  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())

  const validate = () => {
    const errs: Record<string, string> = {}
    for (const f of step.fields) {
      const v = form[f.key]
      const empty = Array.isArray(v) ? v.length === 0 : !v || !String(v).trim()
      if (f.required && empty) {
        errs[f.key] = 'Este campo é obrigatório'
        continue
      }
      if (!empty && f.type === 'whatsapp' && !validateWhats(String(v))) {
        errs[f.key] = 'Digite apenas números, com 11 dígitos (DDD + número)'
      }
      if (!empty && f.type === 'email' && !validateEmail(String(v))) {
        errs[f.key] = 'Digite um e-mail válido, ex: nome@email.com'
      }
    }
    if (step.section.startsWith('1.')) {
      if (form.objetivo === 'Outro' && !String(form.objetivo_outro || '').trim()) {
        errs.objetivo_outro = 'Descreva o objetivo'
      }
      if (form.site_tem === 'Sim' && !String(form.site_link || '').trim()) {
        errs.site_link = 'Cole o link do seu site'
      }
      const redes: string[] = form.redes || []
      for (const r of redes) {
        if (!String(form[`rede_${r}`] || '').trim()) {
          errs[`rede_${r}`] = `Cole o link do ${r}`
        }
      }
    }
    if (step.section.startsWith('4.')) {
      if (form.form === 'Sim') {
        const ff: string[] = form.form_fields || []
        if (ff.length === 0) errs.form_fields = 'Escolha pelo menos uma opção'
        if (ff.includes('Outro') && !String(form.form_outro || '').trim()) {
          errs.form_outro = 'Descreva o campo'
        }
      }
    }
    if (step.section.startsWith('5.')) {
      if (form.fotos === 'Sim' && !String(form.link_fotos || '').trim()) {
        errs.link_fotos = 'Cole o link das fotos'
      }
      if (form.videos === 'Sim' && !String(form.link_videos || '').trim()) {
        errs.link_videos = 'Cole o link dos vídeos'
      }
      if (form.depoi && form.depoi !== 'Não tenho' && !String(form.link_depoi || '').trim()) {
        errs.link_depoi = 'Cole o link dos depoimentos'
      }
    }
    if (step.section.startsWith('6.')) {
      if (form.logo === 'Sim' && !String(form.link_logo || '').trim()) {
        errs.link_logo = 'Cole o link do logotipo'
      }
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validate()) return
    if (stepIdx === totalSteps - 1) {
      setDone(true)
    } else {
      setStepIdx((i) => i + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prev = () => {
    setStepIdx((i) => Math.max(0, i - 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const download = () => {
    const hex2rgb = (hex: string): [number, number, number] => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [0, 0, 0]
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 15
    const contentWidth = pageWidth - 2 * margin
    let yPos = margin

    const addText = (text: string, fontSize: number = 12, bold: boolean = false, color?: string) => {
      doc.setFontSize(fontSize)
      doc.setTextColor(...hex2rgb(color || '#2e3b4b'))
      doc.setFont('Helvetica', bold ? 'bold' : 'normal')
      const lines = doc.splitTextToSize(text, contentWidth)
      doc.text(lines, margin, yPos)
      yPos += lines.length * (fontSize / 3.5) + 2
      if (yPos > pageHeight - margin) {
        doc.addPage()
        yPos = margin
      }
    }

    const addSection = (title: string) => {
      if (yPos > pageHeight - margin - 20) {
        doc.addPage()
        yPos = margin
      }
      addText(title, 14, true, '#3e679f')
      yPos += 2
    }

    const addField = (question: string, answer: any) => {
      if (yPos > pageHeight - margin - 15) {
        doc.addPage()
        yPos = margin
      }
      doc.setFontSize(10)
      doc.setTextColor(...hex2rgb('#2e3b4b'))
      doc.setFont('Helvetica', 'bold')
      const qLines = doc.splitTextToSize(`• ${question}:`, contentWidth)
      doc.text(qLines, margin, yPos)
      yPos += qLines.length * 3 + 1

      const ans = Array.isArray(answer) ? answer.join(', ') : answer == null ? '(sem resposta)' : String(answer)
      doc.setFont('Helvetica', 'normal')
      const aLines = doc.splitTextToSize(ans, contentWidth - 5)
      doc.text(aLines, margin + 5, yPos)
      yPos += aLines.length * 3 + 4
    }

    // Cabeçalho
    doc.setFontSize(16)
    doc.setTextColor(...hex2rgb('#3e679f'))
    doc.setFont('Helvetica', 'bold')
    doc.text('BRIEFING ESTRATÉGICO', margin, yPos)
    yPos += 8

    doc.setFontSize(11)
    doc.setTextColor(...hex2rgb('#2e3b4b'))
    doc.setFont('Helvetica', 'normal')
    doc.text(`Cliente: ${form.nome || 'Não informado'}`, margin, yPos)
    yPos += 6
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.setFont('Helvetica', 'normal')
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, margin, yPos)
    yPos += 10

    // Seções
    for (const s of steps) {
      addSection(s.section)
      for (const f of s.fields) {
        let resposta: any = form[f.key]
        if (f.key === 'objetivo' && form.objetivo === 'Outro') {
          resposta = `Outro: ${form.objetivo_outro || ''}`
        }
        if (f.key === 'site_tem' && form.site_tem === 'Sim') {
          resposta = `Sim — ${form.site_link || ''}`
        }
        if (f.key === 'redes') {
          const redes: string[] = form.redes || []
          resposta = redes.map((r) => `${r}: ${form[`rede_${r}`] || ''}`).join(' | ')
        }
        if (f.key === 'form' && form.form === 'Sim') {
          const ff: string[] = form.form_fields || []
          const detail = ff.map((x) => (x === 'Outro' ? `Outro: ${form.form_outro || ''}` : x)).join(', ')
          resposta = `Sim — Campos: ${detail}`
        }
        addField(f.label, resposta)
        if (f.key === 'fotos' && form.fotos === 'Sim') addField('Link das fotos', form.link_fotos)
        if (f.key === 'videos' && form.videos === 'Sim') addField('Link dos vídeos', form.link_videos)
        if (f.key === 'depoi' && form.depoi && form.depoi !== 'Não tenho') addField('Link dos depoimentos', form.link_depoi)
        if (f.key === 'logo' && form.logo === 'Sim') addField('Link do logotipo', form.link_logo)
      }
    }

    const nomeCliente = form.nome || 'cliente'
    const nomeArquivo = `briefing_lp_${nomeCliente.toLowerCase().replace(/\s+/g, '_')}.pdf`
    doc.save(nomeArquivo)
  }

  if (done) {
    const waUrl = `https://wa.me/${BASTELLI_WA}?text=${encodeURIComponent('Olá! Acabei de preencher o briefing e estou enviando o documento.')}`
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ fontFamily: FONT, backgroundColor: '#fff', color: DARK }}>
        <div className="max-w-md w-full text-center">
          <img
            src={bastelliLogo}
            alt="Bastelli Consultoria"
            className="h-10 w-auto object-contain mx-auto mb-6"
          />
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: '#fdecdf' }}>
            <svg viewBox="0 0 24 24" className="h-12 w-12" fill="none" stroke={ORANGE} strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-3" style={{ color: DARK }}>Tudo pronto!</h1>
          <p className="mb-2" style={{ color: DARK }}>
            <strong>1.</strong> Baixe o documento com suas respostas.
          </p>
          <p className="mb-8" style={{ color: DARK }}>
            <strong>2.</strong> Envie o documento para o WhatsApp da <strong>Bastelli Consultoria</strong> para iniciarmos o seu projeto.
          </p>
          <button
            onClick={download}
            className="w-full rounded-lg px-6 py-3 text-white font-semibold shadow-sm hover:opacity-90 transition mb-3"
            style={{ backgroundColor: ORANGE }}
          >
            Baixar documento
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full rounded-lg px-6 py-3 text-white font-semibold shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: BLUE }}
          >
            Enviar para o WhatsApp da Bastelli
          </a>
          <button onClick={() => { setDone(false); setStepIdx(0); setForm({}) }} className="mt-4 text-sm hover:underline" style={{ color: DARK, opacity: 0.7 }}>
            Preencher novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FONT, color: DARK }}>
      <div
  className="sticky top-0 z-10 border-b"
  style={{
    background: "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
    borderTop: "3px solid #3e679f",
    borderColor: "#e6eaf0",
  }}
>
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-3">
          <div className="flex flex-col items-center mb-4">
            <img
              src={bastelliLogo}
              alt="Bastelli Consultoria"
              className="h-10 w-auto object-contain mx-auto mb-6"
            />
            <p className="mt-2 text-xs sm:text-sm font-semibold tracking-[0.18em] uppercase" style={{ color: BLUE }}>
              Briefing Estratégico
            </p>
          </div>
          <div className="flex items-center justify-between text-xs mb-2" style={{ color: DARK, opacity: 0.6 }}>
            <span>Etapa {stepIdx + 1} de {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ backgroundColor: '#f1f3f6' }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: ORANGE }} />
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 pb-32">
        <p className="text-sm font-semibold mb-1" style={{ color: ORANGE }}>{step.section}</p>
        <h1 className="text-2xl sm:text-3xl font-bold mb-8" style={{ color: DARK }}>{step.title}</h1>

        <div className="space-y-6">
          {step.fields.map((f) => (
            <div key={f.key}>
              <FieldRenderer
                field={f}
                value={form[f.key]}
                error={errors[f.key]}
                onChange={(v) => setValue(f.key, v)}
                onToggleMulti={(opt) => toggleMulti(f.key, opt)}
              />

              {f.key === 'objetivo' && form.objetivo === 'Outro' && (
                <Reveal>
                  <RemovableInput
                    value={form.objetivo_outro || ''}
                    onChange={(v) => setValue('objetivo_outro', v)}
                    onRemove={() => { setValue('objetivo', ''); setValue('objetivo_outro', '') }}
                    placeholder="Descreva o objetivo"
                    error={errors.objetivo_outro}
                  />
                </Reveal>
              )}

              {f.key === 'site_tem' && form.site_tem === 'Sim' && (
                <Reveal label="Link do site">
                  <LinkInput
                    value={form.site_link || ''}
                    onChange={(v) => setValue('site_link', v)}
                    placeholder="Cole o link do site (https://...)"
                    error={errors.site_link}
                  />
                </Reveal>
              )}

              {f.key === 'redes' && (form.redes || []).length > 0 && (
                <Reveal label="Links das redes selecionadas">
                  <div className="space-y-2">
                    {(form.redes as string[]).map((r) => (
                      <LinkInput
                        key={r}
                        value={form[`rede_${r}`] || ''}
                        onChange={(v) => setValue(`rede_${r}`, v)}
                        placeholder={`Link do ${r}`}
                        error={errors[`rede_${r}`]}
                      />
                    ))}
                  </div>
                </Reveal>
              )}

              {f.key === 'form' && form.form === 'Sim' && (
                <Reveal label="Quais campos terá o formulário?">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {FORM_FIELDS.map((opt) => {
                      const cur: string[] = form.form_fields || []
                      const selected = cur.includes(opt)
                      const allSelected = cur.includes('Todos acima')
                      const disabled = allSelected && opt !== 'Todos acima'
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleFormField(opt)}
                          className="text-left rounded-lg border px-4 py-3 text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{
                            borderColor: selected ? ORANGE : '#E5E7EB',
                            backgroundColor: selected ? '#fdecdf' : '#fff',
                            color: selected ? ORANGE : DARK,
                          }}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                  {errors.form_fields && <p className="mt-2 text-xs text-red-500">{errors.form_fields}</p>}
                  {(form.form_fields || []).includes('Outro') && (
                    <div className="mt-3">
                      <RemovableInput
                        value={form.form_outro || ''}
                        onChange={(v) => setValue('form_outro', v)}
                        onRemove={() => {
                          const cur: string[] = form.form_fields || []
                          setValue('form_fields', cur.filter((x) => x !== 'Outro'))
                          setValue('form_outro', '')
                        }}
                        placeholder="Descreva o campo extra"
                        error={errors.form_outro}
                      />
                    </div>
                  )}
                </Reveal>
              )}

              {f.key === 'fotos' && form.fotos === 'Sim' && (
                <Reveal label="Link das fotos">
                  <LinkInput value={form.link_fotos || ''} onChange={(v) => setValue('link_fotos', v)} placeholder="Cole o link das fotos (Drive, Dropbox...)" error={errors.link_fotos} />
                </Reveal>
              )}
              {f.key === 'videos' && form.videos === 'Sim' && (
                <Reveal label="Link dos vídeos">
                  <LinkInput value={form.link_videos || ''} onChange={(v) => setValue('link_videos', v)} placeholder="Cole o link dos vídeos" error={errors.link_videos} />
                </Reveal>
              )}
              {f.key === 'depoi' && form.depoi && form.depoi !== 'Não tenho' && (
                <Reveal label="Link dos depoimentos">
                  <LinkInput value={form.link_depoi || ''} onChange={(v) => setValue('link_depoi', v)} placeholder="Cole o link dos depoimentos" error={errors.link_depoi} />
                </Reveal>
              )}
              {f.key === 'logo' && form.logo === 'Sim' && (
                <Reveal label="Link do logotipo">
                  <LinkInput value={form.link_logo || ''} onChange={(v) => setValue('link_logo', v)} placeholder="Cole o link do logotipo (PNG/SVG)" error={errors.link_logo} />
                </Reveal>
              )}
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t" style={{ borderColor: '#eef0f3' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex gap-3">
          {stepIdx > 0 && (
            <button
              onClick={prev}
              className="flex-1 rounded-lg border px-4 py-3 font-medium hover:bg-gray-50 transition"
              style={{ borderColor: '#E5E7EB', color: DARK }}
            >
              Anterior
            </button>
          )}
          <button
            onClick={next}
            className="flex-1 rounded-lg px-4 py-3 text-white font-semibold shadow-sm hover:opacity-90 transition"
            style={{ backgroundColor: BLUE }}
          >
            {stepIdx === totalSteps - 1 ? 'Finalizar ✓' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Reveal({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div
      className="mt-3 rounded-xl border p-4 animate-revealIn"
      style={{
        borderColor: '#f3d9c6',
        backgroundColor: '#fff8f2',
        borderLeftWidth: 4,
        borderLeftColor: ORANGE,
      }}
    >
      {label && (
        <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: ORANGE }}>
          {label}
        </p>
      )}
      {children}
    </div>
  )
}

function LinkInput({ value, onChange, placeholder, error, className }: { value: string; onChange: (v: string) => void; placeholder?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border bg-white px-4 py-3 outline-none transition"
        style={{ borderColor: error ? '#f87171' : '#E5E7EB', color: DARK, fontFamily: FONT }}
        onFocus={(e) => (e.currentTarget.style.borderColor = ORANGE)}
        onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#f87171' : '#E5E7EB')}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function RemovableInput({ value, onChange, onRemove, placeholder, error, className }: { value: string; onChange: (v: string) => void; onRemove: () => void; placeholder?: string; error?: string; className?: string }) {
  return (
    <div className={className}>
      <div className="flex gap-2 items-stretch">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border bg-white px-4 py-3 outline-none transition"
          style={{ borderColor: error ? '#f87171' : '#E5E7EB', color: DARK, fontFamily: FONT }}
          onFocus={(e) => (e.currentTarget.style.borderColor = ORANGE)}
          onBlur={(e) => (e.currentTarget.style.borderColor = error ? '#f87171' : '#E5E7EB')}
        />
        <button
          type="button"
          onClick={onRemove}
          aria-label="Excluir"
          className="rounded-lg border px-3 hover:opacity-80 transition"
          style={{ borderColor: '#E5E7EB', color: DARK }}
        >
          ✕
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function FieldRenderer({
  field,
  value,
  error,
  onChange,
  onToggleMulti,
}: {
  field: Field
  value: any
  error?: string
  onChange: (v: string) => void
  onToggleMulti: (opt: string) => void
}) {
  const baseInput = 'w-full rounded-lg border bg-white px-4 py-3 outline-none transition'
  const borderColor = error ? '#f87171' : '#E5E7EB'
  const commonStyle = { borderColor, color: DARK, fontFamily: FONT } as React.CSSProperties
  const focusOn = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = ORANGE)
  const focusOff = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.currentTarget.style.borderColor = borderColor)

  const handleWhats = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    onChange(digits)
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-1" style={{ color: DARK }}>
        {field.label}
        {field.required && <span className="ml-1" style={{ color: ORANGE }}>*</span>}
      </label>
      {field.type !== 'radio' && 'hint' in field && field.hint && (
        <p className="text-xs mb-2" style={{ color: DARK, opacity: 0.6 }}>{field.hint}</p>
      )}

      {field.type === 'text' || field.type === 'email' ? (
        <input
          type={field.type}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInput}
          style={commonStyle}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      ) : field.type === 'whatsapp' ? (
        <input
          type="tel"
          inputMode="numeric"
          value={(value as string) || ''}
          onChange={(e) => handleWhats(e.target.value)}
          placeholder="11999999999"
          maxLength={11}
          className={baseInput}
          style={commonStyle}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      ) : field.type === 'textarea' ? (
        <textarea
          rows={4}
          value={(value as string) || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseInput} resize-y`}
          style={commonStyle}
          onFocus={focusOn}
          onBlur={focusOff}
        />
      ) : field.type === 'radio' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {field.options.map((opt) => {
            const selected = field.multi
              ? Array.isArray(value) && value.includes(opt)
              : value === opt
            return (
              <button
                key={opt}
                type="button"
                onClick={() => (field.multi ? onToggleMulti(opt) : onChange(opt))}
                className="text-left rounded-lg border px-4 py-3 text-sm font-medium transition"
                style={{
                  borderColor: selected ? ORANGE : '#E5E7EB',
                  backgroundColor: selected ? '#fdecdf' : '#fff',
                  color: selected ? ORANGE : DARK,
                  fontFamily: FONT,
                }}
              >
                {opt}
              </button>
            )
          })}
        </div>
      ) : null}

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
