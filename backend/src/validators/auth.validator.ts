import { z } from 'zod';

/* ======================================================================
 * Shared enums and helpers
 * ====================================================================== */

const RoleEnum = z.enum(['ADMIN', 'MAYOR', 'VIEWER']);

/* ======================================================================
 * REGISTER SCHEMA (raw)
 * ====================================================================== */

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),

  role: RoleEnum.optional(), // made required through refinement

  cityName: z.string().optional(),
  country: z.string().optional(),

  mayorType: z.enum(['NATIONAL', 'CITY', 'SUBURB']).optional(),

  mayorId: z.number().int().positive().optional(),
});

/* ======================================================================
 * REGISTER RULESET (refined)
 * ======================================================================
 *
 * - MAYOR → must include cityName + country
 * - VIEWER → must include mayorId
 * - ADMIN → no additional fields
 *
 * Handles all cross-field rules and returns human-readable errors.
 * ====================================================================== */

export const registerRefined = registerSchema.superRefine((data, ctx) => {
  // Role must be present
  if (!data.role) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Role is required (ADMIN, MAYOR, or VIEWER)',
      path: ['role'],
    });
    return;
  }

  // MAYOR rules
  if (data.role === 'MAYOR') {
    if (!data.cityName || !data.country) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'cityName and country are required for MAYOR',
        path: ['cityName'], // highlight one; frontend can adjust
      });
    }
    if (!data.mayorType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'mayorType is required for MAYOR registration',
        path: ['mayorType'],
      });
    }
  }

  // VIEWER rules
  if (data.role === 'VIEWER') {
    if (!data.mayorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'mayorId is required for VIEWER',
        path: ['mayorId'],
      });
    }
  }
});

/* ======================================================================
 * LOGIN SCHEMA
 * ====================================================================== */

export const loginSchema = z
  .object({
    username: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .superRefine((data, ctx) => {
    if (!data.username && !data.email) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Either username or email must be provided',
        path: ['username'],
      });
    }
  });
