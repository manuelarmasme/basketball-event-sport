"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import z from "zod";
import { eventSchema } from "@/lib/schemas/events";
import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessage from "@/components/ui/error-message";
import { cn } from "@/lib/utils";
import { formatTimestapToFirebaseTimestamp } from "@/lib/utils/dates";
import { useUpdateEvent } from "@/lib/hooks/useEvents";
import { SportEvent } from "@/lib/types/tournament";
import posthog from "posthog-js";
import { toast } from "sonner";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";

type EventFormData = z.infer<typeof eventSchema>;

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SportEvent;
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
}: EditEventDialogProps) {
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: undefined as unknown as Date,
    maxParticipants: 5,
    googleSheetUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [time, setTime] = useState("12:00");

  const { updateEvent } = useUpdateEvent();

  // Initialize form with event data
  useEffect(() => {
    if (event && open) {
      const eventDate =
        event.date instanceof Timestamp
          ? event.date.toDate()
          : new Date(event.date as Date);

      setFormData({
        name: event.name,
        date: eventDate,
        maxParticipants: event.config.maxParticipants,
        googleSheetUrl: event.googleSheetUrl || "",
      });

      // Set time from event date
      const hours = eventDate.getHours().toString().padStart(2, "0");
      const minutes = eventDate.getMinutes().toString().padStart(2, "0");
      setTime(`${hours}:${minutes}`);
    }
  }, [event, open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formResult = eventSchema.safeParse(formData);

      if (!formResult.success) {
        const flattened = z.flattenError(formResult.error);
        setErrors(flattened.fieldErrors);
      } else {
        const partialEventData: Partial<SportEvent> = {
          name: formResult.data.name,
          date: formatTimestapToFirebaseTimestamp(formResult.data.date),
          config: {
            maxParticipants: formResult.data.maxParticipants,
          },
          googleSheetUrl: formResult.data.googleSheetUrl,
          updatedAt: formatTimestapToFirebaseTimestamp(new Date()),
          updatedBy: auth.currentUser?.uid || "system", // TODO: Replace with actual user
        };

        await updateEvent(event.id, partialEventData);

        setErrors({});
        toast.success("Evento actualizado exitosamente");
        onOpenChange(false);
      }
    } catch (error) {
      posthog.captureException(error, {
        context: "EditEventDialog handleSubmit",
      });

      toast.error(
        "Ocurrió un error al actualizar el evento. Inténtalo de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Evento</DialogTitle>
          <DialogDescription>
            Modifica los detalles del evento y guarda los cambios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="flex flex-col w-full gap-4">
            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="name" aria-label="name">
                Nombre del Evento
              </Label>
              <Input
                id="name"
                name="name"
                required
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
                required
                type="number"
                placeholder="Ingresa la cantidad limite de participantes"
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

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="date">Fecha del Evento</Label>
              <Popover open={isDateOpen} onOpenChange={setIsDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    disabled={isSubmitting}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? (
                      formData.date.toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })
                    ) : (
                      <span>Selecciona una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) {
                        // Combine date with time
                        const [hours, minutes] = time.split(":");
                        const combinedDate = new Date(date);
                        combinedDate.setHours(
                          parseInt(hours),
                          parseInt(minutes),
                          0,
                          0
                        );
                        setFormData({
                          ...formData,
                          date: combinedDate,
                        });
                      }
                      setIsDateOpen(false);
                    }}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />
                </PopoverContent>
              </Popover>

              {errors.date && errors.date[0] && (
                <ErrorMessage errorMessage={errors.date[0]} />
              )}
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="time">Hora del Evento</Label>
              <Input
                type="time"
                id="time"
                required
                value={time}
                onChange={(e) => {
                  setTime(e.target.value);
                  // Update formData date with new time if date exists
                  if (formData.date) {
                    const [hours, minutes] = e.target.value.split(":");
                    const updatedDate = new Date(formData.date);
                    updatedDate.setHours(
                      parseInt(hours),
                      parseInt(minutes),
                      0,
                      0
                    );
                    setFormData({
                      ...formData,
                      date: updatedDate,
                    });
                  }
                }}
                disabled={isSubmitting}
                className="bg-background"
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <Label htmlFor="googleSheetUrl" aria-label="googleSheetUrl">
                Url de Google Sheet
              </Label>
              <Input
                id="googleSheetUrl"
                name="googleSheetUrl"
                required
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    googleSheetUrl: e.target.value as string,
                  })
                }
                value={formData?.googleSheetUrl || ""}
                type="text"
                placeholder="Ingresa la URL de Google Sheet"
                disabled={isSubmitting}
              />

              {errors.googleSheetUrl && errors.googleSheetUrl[0] && (
                <ErrorMessage errorMessage={errors.googleSheetUrl[0]} />
              )}
            </div>

            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  formData.name.length === 0 ||
                  formData.maxParticipants <= 0 ||
                  !formData.date ||
                  formData.googleSheetUrl.length === 0
                }
                aria-label={
                  isSubmitting ? "Actualizando evento..." : "Actualizar Evento"
                }
              >
                {isSubmitting ? (
                  <>
                    <Spinner /> Actualizando...
                  </>
                ) : (
                  "Actualizar Evento"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
