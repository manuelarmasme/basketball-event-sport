import { z } from 'zod';

export const invitationSchema = z.object({
  email: z
    .string({ required_error: 'El email es requerido' })
    .email({ message: 'Debe ser un email válido' })
    .min(1, { message: 'El email no puede estar vacío' }),
  name: z
    .string({ required_error: 'El nombre es requerido' })
    .min(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    .max(100, { message: 'El nombre no puede exceder 100 caracteres' }),
  role: z.enum(['admin', 'manager'], {
    required_error: 'El rol es requerido',
    invalid_type_error: 'El rol debe ser admin o manager',
  }),
});

export type InvitationFormData = z.infer<typeof invitationSchema>;
