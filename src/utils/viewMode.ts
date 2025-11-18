export type ViewMode = 'single' | 'double'

export function getSavedViewMode(): ViewMode {
  try {
    const v = localStorage.getItem('readerPageMode')
    return v === 'single' ? 'single' : 'double'
  } catch { return 'double' }
}

export function setSavedViewMode(mode: ViewMode): void {
  try { localStorage.setItem('readerPageMode', mode) } catch { void 0 }
}

export function normalizePageForMode(page: number, mode: ViewMode): number {
  const p = Math.max(1, page|0)
  if (mode === 'double' && p % 2 === 0) return p - 1
  return p
}
