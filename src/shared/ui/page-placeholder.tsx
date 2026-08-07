import type { Icon } from '@tabler/icons-react'

import { Badge, Card, CardContent } from '@/shared/ui'

type PagePlaceholderProps = {
  description: string
  icon: Icon
  points: readonly string[]
  sequence: string
  title: string
}

export function PagePlaceholder({
  description,
  icon: Icon,
  points,
  sequence,
  title,
}: PagePlaceholderProps) {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center py-8 lg:py-14">
      <div className="grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Badge className="mb-6 font-mono uppercase tracking-[0.14em]" variant="outline">
            {sequence}
          </Badge>
          <h1 className="max-w-4xl font-display text-5xl leading-[0.92] tracking-[-0.055em] sm:text-6xl lg:text-8xl">
            {title}
          </h1>
          <p className="mt-7 max-w-2xl text-balance text-lg text-muted-foreground leading-relaxed sm:text-xl">
            {description}
          </p>
        </div>

        <Card className="animate-in border-border/80 bg-card/80 py-0 shadow-[0.75rem_0.75rem_0_var(--secondary)] fade-in slide-in-from-bottom-4 delay-150 duration-500">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-5">
              <span className="font-mono text-muted-foreground text-xs uppercase tracking-[0.12em]">
                План модуля
              </span>
              <span className="grid size-9 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <Icon aria-hidden="true" className="size-4" />
              </span>
            </div>
            <ol className="divide-y">
              {points.map((point, index) => (
                <li className="flex items-center gap-4 p-5" key={point}>
                  <span className="font-mono text-muted-foreground text-xs tabular-nums">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm">{point}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
