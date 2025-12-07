"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Match } from "@/lib/types/tournament";
import { Trophy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateMatchWinner } from "@/lib/actions/tournament";
import posthog from "posthog-js";
import { cn } from "@/lib/utils";

interface UpdateMatchDialogProps {
  match: Match;
  tournamentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UpdateMatchDialog({
  match,
  tournamentId,
  open,
  onOpenChange,
}: UpdateMatchDialogProps) {
  const [loading, setLoading] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(
    match.winnerId
  );
  const [player1Score, setPlayer1Score] = useState<string>(
    match.players[0]?.score?.toString() || ""
  );
  const [player2Score, setPlayer2Score] = useState<string>(
    match.players[1]?.score?.toString() || ""
  );

  const player1 = match.players[0];
  const player2 = match.players[1];
  const isMatchReady = player1 && player2;
  const isMatchCompleted = match.status === "COMPLETED";

  const handleUpdateMatch = async () => {
    if (!selectedWinner) {
      toast.error("Por favor selecciona un ganador");
      return;
    }

    if (!isMatchReady) {
      toast.error("El partido no está listo para jugarse");
      return;
    }

    setLoading(true);

    try {
      await updateMatchWinner(
        tournamentId,
        match.id,
        selectedWinner,
        "system",
        {
          player1Score: player1Score ? parseInt(player1Score) : undefined,
          player2Score: player2Score ? parseInt(player2Score) : undefined,
        }
      );

      toast.success("Partido actualizado correctamente");
      onOpenChange(false);
    } catch (error) {
      posthog.captureException(error, {
        error_location: "UpdateMatchDialog_handleUpdateMatch",
        tournament_id: tournamentId,
        match_id: match.id,
      });
      toast.error("Error al actualizar el partido. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Actualizar Partido
          </DialogTitle>
          <DialogDescription>
            {isMatchReady
              ? "Selecciona el ganador y agrega los marcadores"
              : "Este partido aún no está listo para jugarse"}
          </DialogDescription>
        </DialogHeader>

        {!isMatchReady ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>Esperando a que se definan los jugadores...</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Player 1 */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all cursor-pointer",
                selectedWinner === player1?.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedWinner(player1?.id || null)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {selectedWinner === player1?.id && (
                    <Trophy className="w-4 h-4 text-primary" />
                  )}
                  <span className="font-semibold">{player1?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="player1-score" className="text-xs">
                    Puntos
                  </Label>
                  <Input
                    id="player1-score"
                    type="number"
                    min="0"
                    value={player1Score}
                    onChange={(e) => setPlayer1Score(e.target.value)}
                    className="w-20"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* VS Divider */}
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-semibold px-2">
                VS
              </span>
            </div>

            {/* Player 2 */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all cursor-pointer",
                selectedWinner === player2?.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => setSelectedWinner(player2?.id || null)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {selectedWinner === player2?.id && (
                    <Trophy className="w-4 h-4 text-primary" />
                  )}
                  <span className="font-semibold">{player2?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="player2-score" className="text-xs">
                    Puntos
                  </Label>
                  <Input
                    id="player2-score"
                    type="number"
                    min="0"
                    value={player2Score}
                    onChange={(e) => setPlayer2Score(e.target.value)}
                    className="w-20"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleUpdateMatch}
                disabled={loading || !selectedWinner}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>{isMatchCompleted ? "Actualizar" : "Guardar"} Resultado</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
