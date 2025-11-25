import { z } from 'zod';
/* ======================================================================
 * CREATE CITY
 * ======================================================================
 * - mayorId is required (every city belongs to a mayor)
 * - name required
 * - country optional (seeded cities sometimes omit country)
 * ====================================================================== */
export const cityCreateSchema = z.object({
    name: z.string().min(1, 'City name is required'),
    country: z.string().optional(),
    mayorId: z.number().int().positive('mayorId must be a positive integer'),
    population: z.number().int().nonnegative().optional(),
    powerUsage: z.number().int().nonnegative().optional(),
    waterUsage: z.number().int().nonnegative().optional(),
    resourceLimit: z.number().int().nonnegative().optional(),
    isActive: z.boolean().optional(),
});
/* ======================================================================
 * SAVE CITY SNAPSHOT (gridState + buildingLog)
 * ======================================================================
 * Matches the structure used by your frontend city editor.
 * ====================================================================== */
export const saveCitySchema = z.object({
    buildingLog: z.array(z.string()).default([]),
    qualityIndex: z.number().min(0, 'qualityIndex must be 0 or greater'),
    gridState: z.object({
        width: z.number().min(1, 'Grid width must be at least 1'),
        height: z.number().min(1, 'Grid height must be at least 1'),
        cells: z
            .array(z.object({
            x: z.number().min(0),
            y: z.number().min(0),
            stack: z
                .array(z.object({
                type: z.string().min(1),
                level: z.number().min(1),
            }))
                .default([]),
        }))
            .default([]),
    }),
});
/* ======================================================================
 * UPDATE CITY
 * ======================================================================
 * Partial version of city creation.
 * Primary use: admin updating city meta info (rare).
 * ====================================================================== */
export const cityUpdateSchema = cityCreateSchema.partial();
/* ======================================================================
 * UPDATE CITY DATA (PUT /api/city/:id/data)
 * ======================================================================
 * Used by your frontend's live simulation save endpoint.
 * ====================================================================== */
export const updateCityDataSchema = z.object({
    body: z.object({
        gridState: z.any().optional(), // grid is JSON → validated server-side in service
        buildingLog: z.any().optional(),
        note: z.string().optional(),
        qualityIndex: z.number().min(0).optional(),
    }),
    params: z.object({
        id: z.string().regex(/^\d+$/, 'City ID must be a numeric string'),
    }),
});
/* ======================================================================
 * EXPORT BUNDLE
 * ====================================================================== */
export default {
    cityCreateSchema,
    saveCitySchema,
    cityUpdateSchema,
    updateCityDataSchema,
};
