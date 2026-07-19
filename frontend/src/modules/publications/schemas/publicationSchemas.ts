import { z } from 'zod';

export const publicationFormSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').refine((v) => v.trim().length > 0, 'No puede ser solo espacios'),
  description: z.string().optional(),
  additionalInfo: z.string().optional(),
  contentTypeCode: z.string().min(1, 'El tipo de contenido es obligatorio'),
  budget: z
    .string()
    .optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), 'Presupuesto inválido'),
  date: z.string().min(1, 'La fecha es obligatoria'),
  time: z.string().min(1, 'La hora es obligatoria'),
  timeZone: z.string().min(1, 'La zona horaria es obligatoria'),
  socialAccountIds: z.array(z.string()).min(1, 'Selecciona al menos una red social'),
});

export type PublicationFormData = z.infer<typeof publicationFormSchema>;

export const markPublishedSchema = z.object({
  evidenceLink: z
    .string()
    .min(1, 'El enlace de evidencia es obligatorio')
    .url('Debe ser un enlace válido'),
});

export type MarkPublishedFormData = z.infer<typeof markPublishedSchema>;
