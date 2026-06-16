# Briefing Estratégico — Bastelli Consultoria

Formulário de briefing em 8 etapas. Ao final, o cliente baixa uma planilha `.xlsx` com as respostas e envia para o WhatsApp da Bastelli Consultoria.

## Stack

- Vite + React + TypeScript
- Tailwind CSS 3
- xlsx (SheetJS) para exportação

## Como rodar localmente

```bash
npm install
cp .env.example .env   # ajuste o número do WhatsApp
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Deploy no Vercel

1. Suba o repositório no GitHub.
2. Importe no Vercel — as configurações padrão já funcionam:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Em **Environment Variables**, defina `VITE_BASTELLI_WHATSAPP` com o número (somente dígitos, com DDI + DDD).
