"use client";

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
import { useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import ErrorMessage from "@/components/ui/error-message";
import { cn } from "@/lib/utils";
import { formatTimestapToFirebaseTimestamp } from "@/lib/utils/dates";
import { useCreateEvent } from "@/lib/hooks/useEvents";
import { SportEvent } from "@/lib/types/tournament";
import { useRouter } from "next/navigation";

type EventFormData = z.infer<typeof eventSchema>;

interface CreateEventFormProps {
  onSuccess?: () => void;
}

export function CreateEventForm({ onSuccess }: CreateEventFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    date: undefined as unknown as Date,
    maxParticipants: 5,
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDateOpen, setIsDateOpen] = useState(false);

  const [time, setTime] = useState("12:00");

  const { createEvent } = useCreateEvent();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsSubmitting(true);

    try {
      const formResult = eventSchema.safeParse(formData);

      if (!formResult.success) {
        const flattened = z.flattenError(formResult.error);
        setErrors(flattened.fieldErrors);

        console.log("errors", flattened.fieldErrors);
        console.log("formData", formData);
      } else {
        const partialEventData: Partial<SportEvent> = {
          name: formResult.data.name,
          date: formatTimestapToFirebaseTimestamp(formResult.data.date),
          config: {
            maxParticipants: formResult.data.maxParticipants,
          },
          event_winner: null,
          status: "registration",
          createdAt: formatTimestapToFirebaseTimestamp(new Date()),
          createdBy: "system",
          updatedAt: null,
          updatedBy: null,
        };

        console.log("partialEventData", partialEventData);

        const eventId = await createEvent(partialEventData);

        setErrors({});

        // Reset form
        setFormData({
          name: "",
          date: undefined as unknown as Date,
          maxParticipants: 5,
        });
        setTime("12:00");

        // Call success callback
        onSuccess?.();

        // Navigate to the tournament page
        if (eventId) {
          router.push(`/${eventId}`);
        }
      }
    } catch (error) {
      console.error("Error creating event:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
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
            value={time}
            onChange={(e) => {
              setTime(e.target.value);
              // Update formData date with new time if date exists
              if (formData.date) {
                const [hours, minutes] = e.target.value.split(":");
                const updatedDate = new Date(formData.date);
                updatedDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
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

        <div className="flex w-full justify-end">
          <Button
            type="submit"
            disabled={
              isSubmitting ||
              formData.name.length === 0 ||
              formData.maxParticipants <= 0 ||
              !formData.date
            }
            aria-label={isSubmitting ? "Creando evento..." : "Crear Evento"}
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
  );
}
