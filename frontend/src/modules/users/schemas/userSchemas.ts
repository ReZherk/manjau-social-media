import { z } from 'zod';

export const createUserSchema = z.object({
  dni: z
    .string()
    .min(1, 'El DNI es obligatorio')
    .regex(/^\d{8}$/, 'El DNI debe tener 8 dígitos'),
  firstName: z
    .string()
    .min(1, 'Los nombres son obligatorios')
    .refine((v) => v.trim().length > 0, 'No puede ser solo espacios'),
  paternalSurname: z
    .string()
    .min(1, 'El apellido paterno es obligatorio')
    .refine((v) => v.trim().length > 0, 'No puede ser solo espacios'),
  maternalSurname: z
    .string()
    .min(1, 'El apellido materno es obligatorio')
    .refine((v) => v.trim().length > 0, 'No puede ser solo espacios'),
  institutionalEmail: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no es válido'),
  roleCode: z.string().min(1, 'El rol es obligatorio'),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1, 'Los nombres son obligatorios'),
  paternalSurname: z.string().min(1, 'El apellido paterno es obligatorio'),
  maternalSurname: z.string().min(1, 'El apellido materno es obligatorio'),
  institutionalEmail: z.string().min(1, 'El correo es obligatorio').email('El correo no es válido'),
  roleCode: z.string().min(1, 'El rol es obligatorio'),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
