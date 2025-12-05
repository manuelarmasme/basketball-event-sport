import { LucideIcon } from "lucide-react"
import { Button } from "./button"

interface EmptyStateProps {
  icon: LucideIcon
  message: string
  ctaText?: string
  ctaAction?: () => void
}

export function EmptyState({
  icon: Icon,
  message,
  ctaText,
  ctaAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <Icon className="size-16 text-muted-foreground/50" strokeWidth={1.5} />
        <p className="text-muted-foreground text-lg max-w-md">{message}</p>
      </div>
      {ctaText && ctaAction && (
        <Button onClick={ctaAction} size="lg">
          {ctaText}
        </Button>
      )}
    </div>
  )
}
