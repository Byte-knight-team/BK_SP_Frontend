import { z } from 'zod';

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits');

export const priceSchema = z
  .string()
  .or(z.number())
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, {
    message: 'Price must be a valid positive number',
  });

export const quantitySchema = z
  .string()
  .or(z.number())
  .transform((val) => Number(val))
  .refine((val) => !isNaN(val) && val >= 0, {
    message: 'Quantity must be a valid positive number',
  });

export const nameSchema = z.string().min(1, 'Name is required');

export const emailSchema = z.string().email('Invalid email address');
