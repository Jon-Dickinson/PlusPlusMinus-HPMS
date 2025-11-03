import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MAYOR', 'VIEWER']).optional(),
  cityName: z.string().optional(),
  country: z.string().optional(),
});

// require cityName + country when role is MAYOR
export const registerRefined = registerSchema.refine((data) => {
  if (data.role === 'MAYOR') return !!(data.cityName && data.country);
  return true;
}, { message: 'cityName and country are required for MAYOR' });

export const loginSchema = z.object({
  username: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(1),
}).refine(data => data.username || data.email, {
  message: "Either username or email must be provided",
});
