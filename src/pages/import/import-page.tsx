import {
  IconCheck,
  IconFile,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconFolderOpen,
  IconLock,
  IconUpload,
  IconAlertTriangle,
  IconX,
} from '@tabler/icons-react'
import { useRef, useState } from 'react'

import {
  validateImportFile,
  type ImportFileValidationError,
  type ValidatedImportFile,
} from '@/features/import/model'
import { createMillenniumPdfStatementParser } from '@/infrastructure/import/millennium'
import { createPdfJsTextExtractor } from '@/infrastructure/import/pdf'
import { reconcileStatement, type ParsedMillenniumStatement } from '@/application/import'
import { messages } from '@/shared/i18n'
import { Badge, Button, Card, CardContent, toast } from '@/shared/ui'

type IntakeState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ file: ValidatedImportFile; status: 'ready' }>
  | Readonly<{ error: ImportFileValidationError; status: 'error' }>

type ReviewState =
  | Readonly<{ status: 'idle' }>
  | Readonly<{ status: 'loading' }>
  | Readonly<{ statement: ParsedMillenniumStatement; status: 'ready'; warnings: number }>
  | Readonly<{ message: string; status: 'error' }>

const acceptedFileTypes =
  '.pdf,.xlsx,.csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

function formatFileSize(bytes: number): string {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} КБ`
    : `${(bytes / (1024 * 1024)).toFixed(1)} МБ`
}

export function ImportPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [intake, setIntake] = useState<IntakeState>({ status: 'idle' })
  const [review, setReview] = useState<ReviewState>({ status: 'idle' })
  const copy = messages.pages.import.intake

  function selectFile(file: File | undefined) {
    if (!file) return

    const result = validateImportFile(file)
    setIntake(
      result.ok
        ? { file: result.value, status: 'ready' }
        : { error: result.error, status: 'error' },
    )
    setReview({ status: 'idle' })
  }

  function clearFile() {
    setIntake({ status: 'idle' })
    setReview({ status: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  async function reviewStatement() {
    if (intake.status !== 'ready') return
    if (intake.file.format !== 'pdf') {
      setReview({ message: 'Для XLSX та CSV parser буде додано окремим кроком.', status: 'error' })
      return
    }
    setReview({ status: 'loading' })
    const notificationId = toast.loading('Читаємо текстовий шар PDF…')
    const extraction = await createPdfJsTextExtractor().extract(
      await intake.file.file.arrayBuffer(),
    )
    if (!extraction.ok) {
      toast.error('Не вдалося прочитати PDF локально.', { id: notificationId })
      setReview({ message: 'Не вдалося прочитати PDF локально.', status: 'error' })
      return
    }
    if (extraction.value.status === 'no_text_layer') {
      toast.warning('У PDF немає текстового шару — OCR не використовується.', {
        id: notificationId,
      })
      setReview({
        message: 'У PDF немає текстового шару. OCR навмисно не використовується.',
        status: 'error',
      })
      return
    }
    toast.loading('Розбираємо операції та звіряємо баланс…', { id: notificationId })
    const parsed = createMillenniumPdfStatementParser().parse(extraction.value)
    if (!parsed.ok) {
      toast.error('Не вдалося розпізнати формат виписки Millennium.', { id: notificationId })
      setReview({
        message: 'Формат PDF не схожий на підтримувану виписку Millennium.',
        status: 'error',
      })
      return
    }
    const warnings = reconcileStatement(parsed.value).issues.length
    toast.success(
      warnings > 0 ? `Перевірено з ${warnings} warning` : 'Виписку перевірено: баланс збігається.',
      { id: notificationId },
    )
    setReview({
      statement: parsed.value,
      status: 'ready',
      warnings,
    })
  }

  const errorMessage =
    intake.status === 'error' &&
    (intake.error.code === 'file_too_large' ? copy.tooLarge : copy.unsupported)

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col py-8 sm:py-12">
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Badge className="mb-5 font-mono uppercase tracking-[0.14em]" variant="outline">
          {messages.pages.import.sequence}
        </Badge>
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <h1 className="font-display text-4xl leading-none tracking-[-0.045em] sm:text-5xl">
              {messages.pages.import.title}
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
              {messages.pages.import.description}
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <IconLock aria-hidden="true" className="size-4 text-primary" />
            <span>{messages.app.localOnly}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
        <Card className="animate-in border-border/80 bg-card py-0 shadow-[0.7rem_0.7rem_0_var(--secondary)] fade-in slide-in-from-bottom-3 delay-100 duration-500">
          <CardContent className="p-3 sm:p-4">
            <input
              accept={acceptedFileTypes}
              aria-label="Вибрати виписку для імпорту"
              className="sr-only"
              data-testid="statement-file-input"
              id="statement-file-input"
              onChange={(event) => selectFile(event.target.files?.[0])}
              ref={inputRef}
              type="file"
            />
            <label
              aria-describedby="import-format-hint"
              className="relative flex min-h-72 flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/40 px-6 text-center transition-colors data-[dragging=true]:border-primary data-[dragging=true]:bg-secondary/65"
              data-dragging={isDragging}
              htmlFor="statement-file-input"
              onDragEnter={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={(event) => {
                event.preventDefault()
                setIsDragging(false)
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                setIsDragging(false)
                selectFile(event.dataTransfer.files[0])
              }}
            >
              <span className="absolute top-0 left-0 px-4 py-3 font-mono text-[0.65rem] text-muted-foreground uppercase tracking-[0.14em]">
                01 / Локальний файл
              </span>

              {intake.status === 'ready' ? (
                <div className="animate-in fade-in zoom-in-95 duration-200">
                  <span className="mx-auto grid size-14 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <IconCheck aria-hidden="true" className="size-7" />
                  </span>
                  <p className="mt-5 font-medium">{intake.file.file.name}</p>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {intake.file.format.toUpperCase()} · {formatFileSize(intake.file.file.size)}
                  </p>
                  <Badge className="mt-4 gap-1.5" variant="secondary">
                    <IconCheck aria-hidden="true" className="size-3" />
                    {copy.statusReady}
                  </Badge>
                  <p className="mx-auto mt-4 max-w-sm text-muted-foreground text-sm leading-relaxed">
                    {copy.processingNext}
                  </p>
                  <Button
                    className="mt-5"
                    disabled={review.status === 'loading'}
                    onClick={reviewStatement}
                    type="button"
                  >
                    {review.status === 'loading' ? 'Перевіряємо локально…' : 'Перевірити виписку'}
                  </Button>
                  <Button className="mt-5" onClick={clearFile} size="sm" variant="ghost">
                    <IconX aria-hidden="true" />
                    {copy.clear}
                  </Button>
                </div>
              ) : (
                <>
                  <span className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    {isDragging ? (
                      <IconUpload aria-hidden="true" className="size-7" />
                    ) : (
                      <IconFolderOpen aria-hidden="true" className="size-7" />
                    )}
                  </span>
                  <p className="mt-5 max-w-sm font-medium">
                    {isDragging ? copy.dropActive : copy.dropHint}
                  </p>
                  <p className="mt-2 text-muted-foreground text-sm" id="import-format-hint">
                    {copy.acceptedFormats}
                  </p>
                  <span className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-2.5 text-primary-foreground text-sm font-medium shadow-sm">
                    <IconFile aria-hidden="true" />
                    {copy.chooseFile}
                  </span>
                  {intake.status === 'error' && (
                    <p className="mt-4 max-w-sm text-destructive text-sm" role="alert">
                      {errorMessage}
                    </p>
                  )}
                </>
              )}
            </label>
          </CardContent>
        </Card>

        <aside className="animate-in fade-in slide-in-from-bottom-3 delay-150 duration-500">
          <Card className="h-full border-border/80 bg-card/70 py-0">
            <CardContent className="flex h-full flex-col p-5">
              <span className="grid size-10 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <IconLock aria-hidden="true" className="size-4" />
              </span>
              <h2 className="mt-5 font-medium">{copy.privacyTitle}</h2>
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">{copy.localOnly}</p>
              <div className="mt-auto border-border border-t pt-5">
                <p className="font-mono text-[0.68rem] text-muted-foreground uppercase tracking-[0.12em]">
                  Підтримані формати
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="gap-1" variant="outline">
                    <IconFileTypePdf aria-hidden="true" className="size-3" />
                    PDF
                  </Badge>
                  <Badge className="gap-1" variant="outline">
                    <IconFileSpreadsheet aria-hidden="true" className="size-3" />
                    XLSX
                  </Badge>
                  <Badge variant="outline">CSV</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>

      {review.status === 'ready' && (
        <Card className="mt-6 border-border/80 bg-card py-0">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs text-muted-foreground uppercase tracking-[0.12em]">
                  02 / Попередній перегляд
                </p>
                <h2 className="mt-2 text-xl font-medium">Виписку розібрано локально</h2>
              </div>
              <Badge variant={review.warnings > 0 ? 'outline' : 'secondary'}>
                {review.warnings > 0 ? `${review.warnings} warnings` : 'Баланс збігається'}
              </Badge>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Операцій</p>
                <p className="mt-1 text-2xl font-medium">{review.statement.transactions.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Період</p>
                <p className="mt-1 font-medium">
                  {review.statement.period.start} — {review.statement.period.end}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Валюта</p>
                <p className="mt-1 text-2xl font-medium">{review.statement.currency}</p>
              </div>
            </div>
            <p className="mt-5 text-muted-foreground text-sm">
              Підтвердження запису в IndexedDB буде активоване після фінального use case імпорту.
            </p>
          </CardContent>
        </Card>
      )}
      {review.status === 'error' && (
        <p className="mt-5 flex items-center gap-2 text-destructive text-sm" role="alert">
          <IconAlertTriangle aria-hidden="true" className="size-4" />
          {review.message}
        </p>
      )}
    </section>
  )
}
