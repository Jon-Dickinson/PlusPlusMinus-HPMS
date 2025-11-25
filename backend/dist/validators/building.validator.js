import { z } from 'zod';
/* ======================================================================
 * Shared: Category Requirements
 * ====================================================================== */
const MinRoleEnum = z.enum(['SUBURB', 'CITY', 'NATIONAL']);
/* ======================================================================
 * CREATE BUILDING
 * ====================================================================== */
export const buildingCreateSchema = z.object({
    name: z.string().min(1, 'Building name is required'),
    // Optional file reference
    file: z.string().optional(),
    // Either categoryId OR categoryName/categoryDescription may be provided
    categoryId: z.number().int().positive().optional(),
    categoryName: z.string().optional(),
    categoryDescription: z.string().optional(),
    // Dimensions
    sizeX: z.number().int().positive('sizeX must be a positive integer'),
    sizeY: z.number().int().positive('sizeY must be a positive integer'),
    blocks: z.number().int().positive('blocks must be a positive integer'),
    // Resources — optional but must be non-negative if provided
    employs: z.number().int().nonnegative().optional(),
    houses: z.number().int().nonnegative().optional(),
    services: z.number().int().nonnegative().optional(),
    feeds: z.number().int().nonnegative().optional(),
    waterUsage: z.number().int().nonnegative().optional(),
    powerUsage: z.number().int().nonnegative().optional(),
    powerOutput: z.number().int().nonnegative().optional(),
    waterOutput: z.number().int().nonnegative().optional(),
    minRoleLevel: MinRoleEnum.optional(),
})
    .superRefine((data, ctx) => {
    // If NO categoryId is given, categoryName must be provided
    if (!data.categoryId && !data.categoryName) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Either categoryId or categoryName must be provided.',
            path: ['categoryId'],
        });
    }
    // If categoryName exists, categoryDescription must be present
    if (data.categoryName && !data.categoryDescription) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'categoryDescription is required when categoryName is provided.',
            path: ['categoryDescription'],
        });
    }
});
/* ======================================================================
 * UPDATE BUILDING
 * ======================================================================
 * Accepts partial fields, but ensures data remains valid if provided.
 * ====================================================================== */
export const buildingUpdateSchema = buildingCreateSchema.partial();
/* ======================================================================
 * CITY PLACEMENT
 * ====================================================================== */
export const cityPlacementCreateSchema = z.object({
    buildingId: z.number().int().positive(),
    gx: z.number().int().optional(),
    gy: z.number().int().optional(),
    quantity: z.number().int().positive().optional(),
});
/* ======================================================================
 * PARAM VALIDATION
 * ====================================================================== */
export const idParamSchema = z.object({
    id: z
        .string()
        .regex(/^[0-9]+$/, 'ID must be a numeric string')
        .transform((s) => s),
    cityId: z.string().optional(),
});
/* ======================================================================
 * Export bundle for convenience
 * ====================================================================== */
export default {
    buildingCreateSchema,
    buildingUpdateSchema,
    cityPlacementCreateSchema,
    idParamSchema,
};
