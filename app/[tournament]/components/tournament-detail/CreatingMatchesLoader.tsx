export default function CreatingMatchesLoader() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-center space-y-3">
            <h3 className="text-2xl font-semibold">Creando torneo...</h3>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>Creando partidos...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                />
                <span>Asignando participantes...</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div
                  className="w-2 h-2 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                />
                <span>Configurando rondas...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
