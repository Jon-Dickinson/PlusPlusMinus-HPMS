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

export const saveCitySchema = z.object({
  buildingLog: z.array(z.string()).default([]),
  qualityIndex: z.number().min(0),
  gridState: z.object({
    width: z.number().min(1),
    height: z.number().min(1),
    cells: z.array(z.object({
      x: z.number().min(0),
      y: z.number().min(0),
      stack: z.array(z.object({
        type: z.string().min(1),
        level: z.number().min(1),
      })).default([]),
    })).default([]),
  }),
});

export const cityUpdateSchema = cityCreateSchema.partial();

export const updateCityDataSchema = z.object({
  body: z.object({
    gridState: z.any().optional(),
    buildingLog: z.any().optional(),
    note: z.string().optional(),
  }),
  params: z.object({
    id: z.string(),
  }),
});
