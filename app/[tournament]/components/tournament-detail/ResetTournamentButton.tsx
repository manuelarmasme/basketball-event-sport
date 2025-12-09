"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { resetAndGenerateTournamentBracket } from "@/lib/actions/tournament";
import { MatchPlayer } from "@/lib/types/tournament";
import posthog from "posthog-js";
import { useAuth } from "@/lib/hooks/useAuth";

interface ResetTournamentButtonProps {
  tournamentId: string;
  participants: MatchPlayer[];
}

export default function ResetTournamentButton({
  tournamentId,
  participants,
}: ResetTournamentButtonProps) {
  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { user } = useAuth();

  const handleReset = async () => {
    if (participants.length < 2) {
      toast.error(
        "Se necesitan al menos 2 participantes para reiniciar el torneo"
      );
      return;
    }

    try {
      setIsResetting(true);

      await resetAndGenerateTournamentBracket(
        tournamentId,
        participants,
        user?.uid as string // You might want to pass the actual user ID
      );

      setOpen(false);
    } catch (error) {
      toast.error("Error al reiniciar el torneo. Por favor, intenta de nuevo.");
      posthog.captureException(error, {
        location: "ResetTournamentButton.handleReset",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 cursor-pointer">
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Reiniciar torneo?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará todos los partidos existentes y generará una
            nueva bracket con los participantes actuales. Esta acción no se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isResetting}
            className="cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            disabled={isResetting}
            className="cursor-pointer"
          >
            {isResetting ? "Reiniciando..." : "Sí, reiniciar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
