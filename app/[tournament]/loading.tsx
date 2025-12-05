import { Spinner } from "@/components/ui/spinner";

// app/[tournament]/loading.tsx
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner className="size-12 text-primary" />
      <p className="text-muted-foreground text-xl">Cargando datos del evento</p>
    </div>
  );
}
