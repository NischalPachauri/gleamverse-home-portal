export function resolveWSBase(): string {
  const loc = typeof window !== 'undefined' ? window.location : { protocol: 'http:', hostname: 'localhost', port: '' }
  const proto = loc.protocol === 'https:' ? 'wss' : 'ws'
  const port = loc.port || (import.meta.env.VITE_PORT || '')
  return `${proto}://${loc.hostname}${port ? `:${port}` : ''}`
}

