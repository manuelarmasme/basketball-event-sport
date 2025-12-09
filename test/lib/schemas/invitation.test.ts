import { describe, it, expect } from 'vitest';
import { invitationSchema } from '@/lib/schemas/invitation';

describe('invitationSchema', () => {
  describe('email validation', () => {
    it('should accept valid email addresses', () => {
      const validData = {
        name: 'Juan Pérez',
        email: 'juan@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: 'not-an-email',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe ser un email válido');
      }
    });

    it('should reject empty email', () => {
      const invalidData = {
        name: 'Juan Pérez',
        email: '',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Empty string fails email validation first
        expect(result.error.issues[0].message).toBe('Debe ser un email válido');
      }
    });
  });

  describe('name validation', () => {
    it('should accept names with valid length', () => {
      const validData = {
        name: 'María García',
        email: 'maria@example.com',
        role: 'manager' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject names shorter than 2 characters', () => {
      const invalidData = {
        name: 'A',
        email: 'test@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El nombre debe tener al menos 2 caracteres'
        );
      }
    });

    it('should reject names longer than 100 characters', () => {
      const invalidData = {
        name: 'A'.repeat(101),
        email: 'test@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'El nombre no puede exceder 100 caracteres'
        );
      }
    });

    it('should accept names with exactly 2 characters', () => {
      const validData = {
        name: 'Ab',
        email: 'test@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept names with exactly 100 characters', () => {
      const validData = {
        name: 'A'.repeat(100),
        email: 'test@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept names with special Spanish characters', () => {
      const validData = {
        name: 'José María Rodríguez Pérez',
        email: 'test@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('role validation', () => {
    it('should accept "admin" role', () => {
      const validData = {
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept "manager" role', () => {
      const validData = {
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid role', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        role: 'superuser',
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Zod enum returns a generic message for invalid values
        expect(result.error.issues[0].message).toContain('Invalid option');
      }
    });

    it('should reject empty role', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        role: '',
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('complete validation', () => {
    it('should reject when multiple fields are invalid', () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'not-an-email', // Invalid email
        role: 'invalid-role', // Invalid role
      };

      const result = invitationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        // Should have at least 2 errors (name and email)
        expect(result.error.issues.length).toBeGreaterThan(1);
      }
    });

    it('should accept complete valid invitation data', () => {
      const validData = {
        name: 'Carlos Martínez',
        email: 'carlos.martinez@example.com',
        role: 'manager' as const,
      };

      const result = invitationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
  });
});
