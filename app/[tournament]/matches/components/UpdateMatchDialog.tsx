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
import { Trophy, Loader2, Ban, ArrowRight } from "lucide-react";
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
  const [step, setStep] = useState<"scores" | "winner">("scores");
  const [player1Score, setPlayer1Score] = useState<string>(
    match.players[0]?.score?.toString() || ""
  );
  const [player2Score, setPlayer2Score] = useState<string>(
    match.players[1]?.score?.toString() || ""
  );
  const [selectedWinner, setSelectedWinner] = useState<string | null>(
    match.winnerId
  );
  const [disqualifiedPlayer, setDisqualifiedPlayer] = useState<string | null>(
    null
  );

  const player1 = match.players[0];
  const player2 = match.players[1];
  const isMatchReady = player1 && player2;
  const isMatchCompleted = match.status === "COMPLETED";

  const handleNext = () => {
    // Validate scores
    const score1 = parseInt(player1Score);
    const score2 = parseInt(player2Score);

    if (player1Score && player2Score) {
      if (isNaN(score1) || isNaN(score2)) {
        toast.error("Por favor ingresa puntajes válidos");
        return;
      }
      if (score1 < 0 || score2 < 0) {
        toast.error("Los puntajes no pueden ser negativos");
        return;
      }
      if (score1 === score2) {
        toast.error("Los puntajes no pueden ser iguales en eliminatorias");
        return;
      }
    }

    setStep("winner");
  };

  const handleBack = () => {
    setStep("scores");
    setDisqualifiedPlayer(null);
  };

  const handleDisqualify = (playerId: string) => {
    setDisqualifiedPlayer(playerId);
    // Auto-select the other player as winner
    const winnerId = playerId === player1?.id ? player2?.id : player1?.id;
    setSelectedWinner(winnerId || null);
  };

  const handleSelectWinner = (playerId: string) => {
    setSelectedWinner(playerId);
    setDisqualifiedPlayer(null);
  };

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
        },
        disqualifiedPlayer || undefined
      );

      toast.success("Partido actualizado correctamente");
      onOpenChange(false);

      // Reset state for next time
      setStep("scores");
      setDisqualifiedPlayer(null);
    } catch (error) {
      posthog.captureException(error, {
        error_location: "UpdateMatchDialog_handleUpdateMatch",
        tournament_id: tournamentId,
        match_id: match.id,
      });
      console.log(error);

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
            {step === "scores" ? "Registrar Puntajes" : "Seleccionar Ganador"}
          </DialogTitle>
          <DialogDescription>
            {!isMatchReady
              ? "Este partido aún no está listo para jugarse"
              : step === "scores"
              ? "Ingresa los puntajes de ambos jugadores"
              : "Confirma el ganador del partido"}
          </DialogDescription>
        </DialogHeader>

        {!isMatchReady ? (
          <div className="py-4 text-center text-muted-foreground">
            <p>Esperando a que se definan los jugadores...</p>
          </div>
        ) : step === "scores" ? (
          // STEP 1: Score Input
          <div className="space-y-4 py-4">
            {/* Player 1 Score */}
            <div className="space-y-2">
              <Label htmlFor="player1-score" className="text-sm font-semibold">
                {player1?.name}
              </Label>
              <Input
                id="player1-score"
                type="number"
                min="0"
                value={player1Score}
                onChange={(e) => setPlayer1Score(e.target.value)}
                placeholder="Ingresa los puntos"
                className="text-lg"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-semibold">
                VS
              </span>
            </div>

            {/* Player 2 Score */}
            <div className="space-y-2">
              <Label htmlFor="player2-score" className="text-sm font-semibold">
                {player2?.name}
              </Label>
              <Input
                id="player2-score"
                type="number"
                min="0"
                value={player2Score}
                onChange={(e) => setPlayer2Score(e.target.value)}
                placeholder="Ingresa los puntos"
                className="text-lg"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1"
                onClick={handleNext}
                disabled={!player1Score || !player2Score}
              >
                Siguiente
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          // STEP 2: Winner Selection
          <div className="space-y-4 py-4">
            {/* Player 1 Card */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all cursor-pointer relative",
                selectedWinner === player1?.id && !disqualifiedPlayer
                  ? "border-primary bg-primary/5"
                  : disqualifiedPlayer === player1?.id
                  ? "border-destructive bg-destructive/5 opacity-60"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleSelectWinner(player1?.id || "")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedWinner === player1?.id && !disqualifiedPlayer && (
                    <Trophy className="w-5 h-5 text-primary" />
                  )}
                  {disqualifiedPlayer === player1?.id && (
                    <Ban className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold">{player1?.name}</p>
                    <p className="text-2xl font-bold text-primary">
                      {player1Score} pts
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisqualify(player1?.id || "");
                  }}
                  disabled={disqualifiedPlayer === player1?.id}
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Descalificar
                </Button>
              </div>
            </div>

            {/* Player 2 Card */}
            <div
              className={cn(
                "p-4 rounded-lg border-2 transition-all cursor-pointer relative",
                selectedWinner === player2?.id && !disqualifiedPlayer
                  ? "border-primary bg-primary/5"
                  : disqualifiedPlayer === player2?.id
                  ? "border-destructive bg-destructive/5 opacity-60"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => handleSelectWinner(player2?.id || "")}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedWinner === player2?.id && !disqualifiedPlayer && (
                    <Trophy className="w-5 h-5 text-primary" />
                  )}
                  {disqualifiedPlayer === player2?.id && (
                    <Ban className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold">{player2?.name}</p>
                    <p className="text-2xl font-bold text-primary">
                      {player2Score} pts
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDisqualify(player2?.id || "");
                  }}
                  disabled={disqualifiedPlayer === player2?.id}
                >
                  <Ban className="w-4 h-4 mr-1" />
                  Descalificar
                </Button>
              </div>
            </div>

            {disqualifiedPlayer && (
              <p className="text-sm text-center text-muted-foreground">
                Jugador descalificado. El oponente avanza automáticamente.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleBack}
                disabled={loading}
              >
                Atrás
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
                  <>{isMatchCompleted ? "Actualizar" : "Confirmar"} Resultado</>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
