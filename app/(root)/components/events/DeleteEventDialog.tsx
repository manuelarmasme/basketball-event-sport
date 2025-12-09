"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import posthog from "posthog-js";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventName: string;
  onConfirm: (eventId: string) => Promise<void>;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  eventId,
  eventName,
  onConfirm,
}: DeleteEventDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm(eventId);
      onOpenChange(false);
    } catch (error) {
      posthog.captureException(error, {
        context: "DeleteEventDialog handleConfirm",
      });
      // Error handling is done in the parent component
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <DialogTitle className="text-red-500">Eliminar Evento</DialogTitle>
          </div>
          <DialogDescription className="pt-3">
            ¿Estás seguro de que deseas eliminar el evento{" "}
            <span className="font-semibold text-white"> {eventName}</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md bg-red-950/20 border border-red-900/50 p-4">
            <p className="text-sm text-red-400">
              Esta acción eliminará permanentemente:
            </p>
            <ul className="mt-2 text-sm text-red-400 list-disc list-inside space-y-1">
              <li>Todos los partidos del torneo</li>
              <li>Todos los participantes inscritos</li>
              <li>El evento completo</li>
            </ul>
            <p className="mt-3 text-sm font-semibold text-red-300">
              Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner className="mr-2" />
                Eliminando...
              </>
            ) : (
              "Eliminar Evento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
