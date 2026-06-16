/// <reference types="vite/client" />

declare module '*.png' {
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_BASTELLI_WHATSAPP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
