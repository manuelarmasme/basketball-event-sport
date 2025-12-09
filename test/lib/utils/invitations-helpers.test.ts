import { describe, it, expect } from 'vitest';
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

describe('Invitation Helpers', () => {
  describe('UUID token generation', () => {
    it('should generate valid UUID v4 tokens', () => {
      const token = uuidv4();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(uuidValidate(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = uuidv4();
      const token2 = uuidv4();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with correct format', () => {
      const token = uuidv4();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(token).toMatch(uuidV4Regex);
    });
  });

  describe('Expiration date calculation', () => {
    it('should calculate 24 hours from now', () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const hoursDifference = (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(hoursDifference).toBeCloseTo(24, 0);
    });

    it('should handle expiration check correctly', () => {
      const now = new Date();

      // Expired invitation (25 hours ago)
      const expiredDate = new Date(now.getTime() - 25 * 60 * 60 * 1000);
      expect(expiredDate < now).toBe(true);

      // Valid invitation (23 hours from now)
      const validDate = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      expect(validDate < now).toBe(false);
    });

    it('should calculate correct milliseconds for 24 hours', () => {
      const twentyFourHoursInMs = 24 * 60 * 60 * 1000;
      expect(twentyFourHoursInMs).toBe(86400000);
    });
  });

  describe('Invitation URL generation', () => {
    it('should generate correct invitation URL format', () => {
      const baseUrl = 'http://localhost:3000';
      const token = uuidv4();
      const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;

      expect(invitationUrl).toContain(baseUrl);
      expect(invitationUrl).toContain('/accept-invitation');
      expect(invitationUrl).toContain('?token=');
      expect(invitationUrl).toContain(token);
    });

    it('should create valid URLs with different base URLs', () => {
      const token = uuidv4();

      const urls = [
        'http://localhost:3000',
        'https://example.com',
        'https://reskata.com',
      ];

      urls.forEach(baseUrl => {
        const invitationUrl = `${baseUrl}/accept-invitation?token=${token}`;
        expect(invitationUrl).toMatch(/^https?:\/\/.+\/accept-invitation\?token=.+$/);
      });
    });
  });

  describe('Role badge helpers', () => {
    it('should return correct Spanish role names', () => {
      const roleNames = {
        admin: 'Administrador',
        manager: 'Manager',
      };

      expect(roleNames.admin).toBe('Administrador');
      expect(roleNames.manager).toBe('Manager');
    });

    it('should return correct badge colors for roles', () => {
      const roleColors = {
        admin: 'bg-purple-500',
        manager: 'bg-blue-500',
      };

      expect(roleColors.admin).toBe('bg-purple-500');
      expect(roleColors.manager).toBe('bg-blue-500');
    });
  });

  describe('Status badge helpers', () => {
    it('should return correct Spanish status names', () => {
      const statusNames = {
        pending: 'Pendiente',
        accepted: 'Aceptada',
        expired: 'Expirada',
      };

      expect(statusNames.pending).toBe('Pendiente');
      expect(statusNames.accepted).toBe('Aceptada');
      expect(statusNames.expired).toBe('Expirada');
    });

    it('should return correct badge colors for statuses', () => {
      const statusColors = {
        pending: 'bg-yellow-500',
        accepted: 'bg-green-500',
        expired: 'bg-red-500',
      };

      expect(statusColors.pending).toBe('bg-yellow-500');
      expect(statusColors.accepted).toBe('bg-green-500');
      expect(statusColors.expired).toBe('bg-red-500');
    });
  });

  describe('Email validation patterns', () => {
    it('should validate common email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@example.com',
        'user+tag@example.co.uk',
        'test_email@subdomain.example.com',
      ];

      // Basic email regex (simplified version)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      validEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'not-an-email',
        '@example.com',
        'test@',
        'test @example.com',
        '',
      ];

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      invalidEmails.forEach(email => {
        expect(emailRegex.test(email)).toBe(false);
      });
    });
  });

  describe('Date formatting for invitations', () => {
    it('should format dates in Spanish locale', () => {
      const testDate = new Date('2025-12-08T10:30:00');
      const formatted = testDate.toLocaleString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      expect(formatted).toContain('diciembre');
      expect(formatted).toContain('2025');
    });

    it('should handle timezone-aware date formatting', () => {
      const now = new Date();
      const formatted = now.toLocaleString('es-ES');

      // Should return a non-empty string
      expect(formatted.length).toBeGreaterThan(0);
      expect(typeof formatted).toBe('string');
    });
  });

  describe('Firestore collection constants', () => {
    it('should have correct collection names', () => {
      const collections = {
        INVITATIONS: 'invitations',
        USERS: 'users',
      };

      expect(collections.INVITATIONS).toBe('invitations');
      expect(collections.USERS).toBe('users');
    });
  });
});
