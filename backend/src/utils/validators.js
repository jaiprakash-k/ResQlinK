import { z } from 'zod';

export const sosSchema = z.object({
  userId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  message: z.string().min(1).max(280),
  timestamp: z.number().int().positive(),
});

export const chatMessageSchema = z.object({
  id: z.string().optional(),
  fromUser: z.string().min(1),
  toUser: z.string().min(1),
  message: z.string().min(1).max(500),
  timestamp: z.number().int().positive(),
});

export const chatSyncSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(100),
});

export function validate(schema, data) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const details = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    const err = new Error(`ValidationError: ${details}`);
    err.status = 400;
    throw err;
  }
  return parsed.data;
}
