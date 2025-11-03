import { z } from 'zod';

export const userCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'MAYOR', 'VIEWER']).optional(),
  nationality: z.string().optional(),
  homeCity: z.string().optional(),
});

export const userUpdateSchema = userCreateSchema.partial();
