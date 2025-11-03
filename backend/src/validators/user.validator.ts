import { z } from 'zod';

export const userCreateSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(6).optional(),
  role: z.enum(['ADMIN', 'MAYOR', 'VIEWER']).optional(),
});

export const userUpdateSchema = userCreateSchema.partial();
