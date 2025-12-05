import { Spinner } from "./spinner"

interface LoadingProps {
  message?: string
}

export function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner className="size-12 text-primary" />
      {message && (
        <p className="text-muted-foreground text-xl">{message}</p>
      )}
    </div>
  )
}
