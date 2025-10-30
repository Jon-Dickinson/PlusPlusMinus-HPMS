import { z } from 'zod'

export const buildingCreateSchema = z.object({
  name: z.string().min(1),
  file: z.string().optional(),
  categoryId: z.number().int().positive().optional(),
  categoryName: z.string().optional(),
  categoryDescription: z.string().optional(),
  sizeX: z.number().int().positive(),
  sizeY: z.number().int().positive(),
  blocks: z.number().int().positive(),
  employs: z.number().int().nonnegative().optional(),
  houses: z.number().int().nonnegative().optional(),
  services: z.number().int().nonnegative().optional(),
  feeds: z.number().int().nonnegative().optional(),
  waterUsage: z.number().int().nonnegative().optional(),
  powerUsage: z.number().int().nonnegative().optional(),
  powerOutput: z.number().int().nonnegative().optional(),
  waterOutput: z.number().int().nonnegative().optional(),
  minRoleLevel: z.enum(['SUBURB', 'CITY', 'NATIONAL']).optional(),
})

export const buildingUpdateSchema = buildingCreateSchema.partial().extend({
  // id should be in params, not body; allow empty body but at least one key would be better
})

export const cityPlacementCreateSchema = z.object({
  buildingId: z.number().int().positive(),
  gx: z.number().int().optional(),
  gy: z.number().int().optional(),
  quantity: z.number().int().positive().optional(),
})

export const idParamSchema = z.object({ id: z.string().regex(/^[0-9]+$/).transform((s) => s), cityId: z.string().optional() })

export default { buildingCreateSchema, buildingUpdateSchema, cityPlacementCreateSchema, idParamSchema }
