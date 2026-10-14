/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 基地址，未配置时回退到本地开发地址 */
  readonly VITE_API_BASE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
