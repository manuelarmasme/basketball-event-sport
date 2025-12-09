import { z } from 'zod';

export const invitationSchema = z.object({
  email: z
    .email({ message: 'Debe ser un email válido' })
    .min(1, { message: 'El email no puede estar vacío' }),
  name: z
    .string({ message: 'El nombre es requerido' })
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  role: z.array(z.enum(['admin', 'manager'])).min(1, { message: 'Selecciona al menos un rol' }),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;
