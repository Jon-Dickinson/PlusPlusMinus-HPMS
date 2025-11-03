import { z } from 'zod';
export const noteSchema = z.object({ content: z.string().default('') });
