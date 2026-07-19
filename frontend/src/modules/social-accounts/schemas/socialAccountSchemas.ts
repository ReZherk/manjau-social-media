import { z } from 'zod';

export const createSocialAccountSchema = z.object({
  platformCode: z.string().min(1, 'La plataforma es obligatoria'),
  accountName: z
    .string()
    .min(1, 'El nombre de la cuenta es obligatorio')
    .refine((v) => v.trim().length > 0, 'No puede ser solo espacios'),
  accessUsername: z.string().min(1, 'El usuario de acceso es obligatorio'),
  accessSecret: z.string().min(1, 'La credencial de acceso es obligatoria'),
});

// On edit, credentials are optional (leave blank to keep current ones).
export const editSocialAccountSchema = z.object({
  platformCode: z.string().min(1, 'La plataforma es obligatoria'),
  accountName: z.string().min(1, 'El nombre de la cuenta es obligatorio'),
  accessUsername: z.string().optional(),
  accessSecret: z.string().optional(),
});

export type CreateSocialAccountFormData = z.infer<typeof createSocialAccountSchema>;
export type EditSocialAccountFormData = z.infer<typeof editSocialAccountSchema>;
