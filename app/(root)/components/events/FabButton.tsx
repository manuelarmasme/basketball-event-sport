"use client";

import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import z from "zod";
import { eventSchema } from "@/lib/schemas/events";
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessage from "@/components/ui/error-message";

type EventFormData = z.infer<typeof eventSchema>;

export default function FabButton() {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: null as unknown as Date,
    maxParticipants: 0,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      console.log("inside handleSubmit");

      const formResult = eventSchema.safeParse(formData);

      if (!formResult.success) {
        const flattened = z.flattenError(formResult.error);
        setErrors(flattened.fieldErrors);
        console.log("fieldErrors", flattened.fieldErrors);
      } else {
        console.log("todo ok");
        setErrors({}); // Clear errors on success
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="absolute fixed bottom-0 right-0 m-4">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="secondary"
            size="icon-lg"
            aria-label="Submit"
            className="rounded-full cursor-pointer shadow-lg hover:shadow-xl focus:shadow-xl transition-shadow"
          >
            <Plus
              className="size-8 text-muted-foreground/50 text-primary "
              strokeWidth={1.5}
            />
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Evento</DialogTitle>

            <DialogDescription>
              Aquí va el formulario para crear un nuevo evento.
            </DialogDescription>
          </DialogHeader>

          {/* Aquí va el contenido del formulario */}
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col w-full gap-4">
              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="name" aria-label="name">
                  Nombre del Evento
                </Label>
                <Input
                  id="name"
                  name="name"
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value as string })
                  }
                  value={formData?.name || ""}
                  type="text"
                  placeholder="Ingresa el nombre del evento"
                  disabled={isSubmitting}
                />

                {errors.name && errors.name[0] && (
                  <ErrorMessage errorMessage={errors.name[0]} />
                )}
              </div>

              <div className="w-full flex flex-col gap-2">
                <Label htmlFor="participants">Cantidad de participantes</Label>
                <Input
                  id="participants"
                  name="participants"
                  type="number"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value) || 0,
                    })
                  }
                  value={formData?.maxParticipants}
                  disabled={isSubmitting}
                />

                {errors.maxParticipants && errors.maxParticipants[0] && (
                  <ErrorMessage errorMessage={errors.maxParticipants[0]} />
                )}
              </div>

              <div className="flex w-full justify-end">
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    formData.name.length === 0 ||
                    formData.maxParticipants <= 0
                  }
                  aria-label={
                    isSubmitting ? "Creando evento..." : "Crear Evento"
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Spinner /> Creando evento...
                    </>
                  ) : (
                    "Crear Evento"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
