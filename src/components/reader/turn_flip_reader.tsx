import { useEffect, useRef, useState } from 'react'
import { Document } from 'react-pdf'
import '../../../flipbook.style.css'

interface TurnFlipReaderProps {
  pdfPath: string
  currentPage: number
  totalPages: number
  pageWidth: number
  theme: 'light' | 'sepia' | 'dark'
  onPageChange: (page: number) => void
  isFullscreen?: boolean
  onDocumentLoadSuccess?: (pdf: unknown) => void
  onDocumentLoadError?: (error: Error) => void
}

export function TurnFlipReader({
  pdfPath,
  currentPage,
  totalPages,
  pageWidth,
  theme,
  onPageChange,
  isFullscreen = false,
  onDocumentLoadSuccess,
  onDocumentLoadError
}: TurnFlipReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const apiRef = useRef<{ goToPage: (n: number) => void; destroy: () => void } | null>(null)
  type JQueryStub = {
    (el: Element): {
      css: (obj: Record<string, string>) => void
      flipBook: (opts: unknown) => { goToPage: (n: number) => void; destroy: () => void }
      on: (event: string, handler: (e: unknown, leftIndex: number) => void) => void
      off: (event: string) => void
    }
  }
  const $ref = useRef<JQueryStub | null>(null)

  const [loading, setLoading] = useState(true)

  const supports3D = () => {
    try {
      const el = document.createElement('div')
      el.style.transform = 'translateZ(0)'
      return !!el.style.transform
    } catch { return false }
  }

  useEffect(() => {
    let mounted = true
    const ensureScript = (src: string) => new Promise<void>((resolve, reject) => {
      const existing = Array.from(document.scripts).find(s => s.src.endsWith(src))
      if (existing) return resolve()
      const s = document.createElement('script')
      s.src = src
      s.onload = () => resolve()
      s.onerror = () => reject(new Error('failed to load ' + src))
      document.head.appendChild(s)
    })
    const ensureCss = (href: string) => {
      const existing = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).find(l => (l as HTMLLinkElement).href.endsWith(href))
      if (existing) return
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = href
      document.head.appendChild(l)
    }
    const init = async () => {
      try {
        ensureCss('/flipbook.style.css')
        await ensureScript('/book-effect-20251118T155340Z-1-001/book-effect/jquery.js')
        await ensureScript('/flipbook.min.js')
        type PdfGlobal = { GlobalWorkerOptions: { workerSrc: string } }
        const pdfjsModule = await import('pdfjs-dist/build/pdf') as unknown as PdfGlobal
        const worker = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
        ;(window as unknown as { pdfjsLib: PdfGlobal }).pdfjsLib = pdfjsModule
        ;(window as unknown as { pdfjsLib: PdfGlobal }).pdfjsLib.GlobalWorkerOptions.workerSrc = worker
        const w = window as unknown as { jQuery?: JQueryStub; $?: JQueryStub }
        $ref.current = w.jQuery || w.$ || null
        if (!$ref.current || !containerRef.current) return
        const $el = $ref.current(containerRef.current)
        const width = pageModeWidth(pageWidth)
        const height = Math.floor(pageWidth * 1.414)
        $el.css({ width: width + 'px', height: height + 'px' })
        const opts = {
          pdfUrl: pdfPath,
          layout: supports3D() ? '2' : '1',
          startPage: Math.max(0, (currentPage | 0) - 1),
          backgroundTransparent: true,
          pdfPageScale: 1
        }
        apiRef.current = $el.flipBook(opts)
        $el.on('flipbookReady', (_e: unknown, pageCount: number) => {
          try { onDocumentLoadSuccess?.({ numPages: pageCount } as unknown) } catch { void 0 }
        })
        $el.on('flipbookError', (_e: unknown, msg: unknown) => {
          try { onDocumentLoadError?.(new Error(String(msg))) } catch { void 0 }
        })
        $el.on('pageChange', (_e: unknown, leftIndex: number) => {
          const next = Math.max(1, Math.min(totalPages || leftIndex + 1, leftIndex + 1))
          onPageChange(next % 2 === 0 ? next - 1 : next)
        })
        if (mounted) setLoading(false)
      } catch (e) {
        console.error('flipbook init failed', e)
      }
    }
    init()
    return () => {
      mounted = false
      try {
        const w = window as unknown as { jQuery?: JQueryStub; $?: JQueryStub }
        const $ = w.jQuery || w.$
        if ($ && containerRef.current) {
          $(containerRef.current).off('pageChange')
          $(containerRef.current).off('flipbookReady')
          $(containerRef.current).off('flipbookError')
        }
      } catch { void 0 }
      try { apiRef.current?.destroy() } catch { void 0 }
    }
  }, [pdfPath])

  useEffect(() => {
    if (!apiRef.current) return
    try { apiRef.current.goToPage(Math.max(0, currentPage - 1)) } catch { void 0 }
  }, [currentPage])

  return (
    <div
      className={themeClass(theme)}
      style={{
        width: pageModeWidth(pageWidth),
        height: Math.floor(pageWidth * 1.414),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '3px solid rgba(0,0,0,.1)', borderTopColor: 'rgba(0,0,0,.3)', animation: 'spin 0.6s linear infinite' }} />
          </div>
        )}
      </div>
    </div>
  )
}

function pageModeWidth(pageWidth: number) {
  return Math.floor(pageWidth * 2)
}

function themeClass(theme: 'light' | 'sepia' | 'dark') {
  if (theme === 'light') return 'bg-white'
  if (theme === 'sepia') return 'bg-amber-50'
  return 'bg-slate-900'
}
