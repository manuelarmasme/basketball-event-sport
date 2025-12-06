"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ErrorMessage from "@/components/ui/error-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateParticipant } from "@/lib/hooks/useEvents";
import { newPlayerInscriptionSchema } from "@/lib/schemas/player";
import { Plus } from "lucide-react";
import { useParams } from "next/dist/client/components/navigation";
import posthog from "posthog-js";
import { useState } from "react";
import { toast } from "sonner";
import z from "zod";

type PlayerFormData = z.infer<typeof newPlayerInscriptionSchema>;

export default function CreateInscriptionDialog() {
  const [open, setOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<PlayerFormData>({
    name: "",
  });

  const { createParticipant } = useCreateParticipant();
  const params = useParams();

  async function handleSubmit() {
    try {
      setIsSubmitting(true);

      const formResult = newPlayerInscriptionSchema.safeParse(formData);

      if (!formResult.success) {
        const flattened = z.flattenError(formResult.error);
        setErrors(flattened.fieldErrors);
      } else {
        const tournamentId = params.tournament as string;

        await createParticipant({ name: formData.name }, tournamentId);

        toast.success(`Participante ${formData.name} inscrito correctamente.`);
        setOpen(false);
        setFormData({ name: "" });
        setErrors({});
      }
    } catch (error) {
      posthog.captureException(error, {
        error_location: "CreateInscriptionDialog_handleSubmit",
        participant_name: formData.name,
        tournament_id: params.tournament,
      });
      toast.error("Error al inscribir al participante. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Inscribir a un nuevo participante
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-2">
            <Label htmlFor="name" aria-label="name">
              Nombre del Participante
            </Label>
            <Input
              id="name"
              name="name"
              required
              onChange={(e) => setFormData({ name: e.target.value as string })}
              value={formData?.name || ""}
              type="text"
              placeholder="Ingresa el nombre del participante"
              disabled={isSubmitting}
            />

            {errors.name && errors.name[0] && (
              <ErrorMessage errorMessage={errors.name[0]} />
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="button"
            onClick={handleSubmit}
            variant="default"
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Inscribiendo..." : "Inscribir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
