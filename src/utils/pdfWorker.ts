export function getWorkerSrc(): string {
  return new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
}

