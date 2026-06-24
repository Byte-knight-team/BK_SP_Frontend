import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const signupPersonalSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  phone: z
    .string()
    .regex(/^07\d{8}$/, 'Phone number must be exactly 10 digits and start with 07 (e.g., 0712345678).'),
  password: z
    .string()
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      'Password must be at least 8 characters, with 1 uppercase, 1 lowercase, 1 number, and 1 special character.'
    ),
});

export const signupAddressSchema = z.object({
  line1: z.string().min(3, 'Address line is required.'),
  city: z.string().min(2, 'City is required.'),
  postalCode: z.string().min(3, 'Postal code is required.'),
});

export const mobileVerificationSchema = z.object({
  phone: z
    .string()
    .regex(/^07\d{8}$/, 'Phone number must be exactly 10 digits and start with 07 (e.g., 0712345678).'),
});
