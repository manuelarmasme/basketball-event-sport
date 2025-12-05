import {z} from "zod";

export const eventSchema = z.object({
  name: z.string().min(3,{ message: "El nombre debe tener al menos 3 caracteres" }).max(100, { message: "El nombre no puede exceder los 100 caracteres" }),
  date: z.date().min(new Date("2025-01-01"), { message: "La fecha debe ser en el futuro" }),
  maxParticipants: z.number().min(1, { message: "Debe haber al menos un participante" }),
});