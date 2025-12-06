import z from "zod";

export const newPlayerInscriptionSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
});