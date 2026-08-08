import {
  getDocument,
  GlobalWorkerOptions,
  PasswordException,
} from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { TextItem } from 'pdfjs-dist/types/src/display/api'
import pdfWorkerUrl from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url'

import type {
  PdfTextExtraction,
  PdfTextExtractionResult,
  PdfTextExtractor,
  PdfTextFragment,
  PdfTextPage,
} from '@/application/import'

export class PdfJsTextExtractor implements PdfTextExtractor {
  async extract(pdfData: ArrayBuffer): Promise<PdfTextExtractionResult> {
    if (typeof Worker !== 'undefined') {
      GlobalWorkerOptions.workerSrc = pdfWorkerUrl
    }
    const loadingTask = getDocument({ data: new Uint8Array(pdfData), disableFontFace: true })

    try {
      const document = await loadingTask.promise
      const pages: PdfTextPage[] = []

      for (let number = 1; number <= document.numPages; number += 1) {
        const page = await document.getPage(number)
        const viewport = page.getViewport({ scale: 1 })
        const content = await page.getTextContent()
        const text = content.items.flatMap((item, index) => toTextFragment(item, index))

        pages.push(
          Object.freeze({
            height: viewport.height,
            number,
            text: Object.freeze(text),
            width: viewport.width,
          }),
        )
      }

      const result: PdfTextExtraction = pages.some((page) => page.text.length > 0)
        ? Object.freeze({
            pageCount: document.numPages,
            pages: Object.freeze(pages),
            status: 'extracted',
          })
        : Object.freeze({ pageCount: document.numPages, status: 'no_text_layer' })

      return { ok: true, value: result }
    } catch (error) {
      return {
        error: {
          code:
            error instanceof PasswordException
              ? 'password_protected'
              : error instanceof Error && error.name === 'InvalidPDFException'
                ? 'invalid_pdf'
                : 'unexpected_pdf_error',
        },
        ok: false,
      }
    } finally {
      await loadingTask.destroy()
    }
  }
}

export function createPdfJsTextExtractor(): PdfTextExtractor {
  return new PdfJsTextExtractor()
}

function toTextFragment(item: TextItem | unknown, index: number): PdfTextFragment[] {
  if (!isTextItem(item)) return []

  const text = item.str.trim()
  if (text.length === 0) return []

  return [
    Object.freeze({
      height: item.height,
      index,
      text,
      width: item.width,
      x: item.transform[4],
      y: item.transform[5],
    }),
  ]
}

function isTextItem(item: unknown): item is TextItem {
  return typeof item === 'object' && item !== null && 'str' in item && typeof item.str === 'string'
}
