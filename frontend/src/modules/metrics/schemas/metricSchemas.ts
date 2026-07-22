import { z } from 'zod';
export const metricSchema = z.object({
  reactions: z.coerce.number().int().min(0), reach: z.coerce.number().int().min(0), saves: z.coerce.number().int().min(0),
  shares: z.coerce.number().int().min(0), comments: z.coerce.number().int().min(0),
});
export type MetricFormData = z.infer<typeof metricSchema>;
