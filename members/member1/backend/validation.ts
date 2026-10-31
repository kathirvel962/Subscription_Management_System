import { z } from 'zod';
import { PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE } from '../../../shared/constants/index.js';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE),
});

export const CreateStaffSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_REQUIREMENTS_MESSAGE),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  taxId: z.string().optional(),
});
