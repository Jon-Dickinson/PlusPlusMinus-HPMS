import { z } from 'zod';

export const cityCreateSchema = z.object({
  name: z.string().min(1),
  country: z.string().optional(),
  mayorId: z.number().int().positive(),
  population: z.number().int().nonnegative().optional(),
  powerUsage: z.number().int().nonnegative().optional(),
  waterUsage: z.number().int().nonnegative().optional(),
  resourceLimit: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

export const cityUpdateSchema = cityCreateSchema.partial();
