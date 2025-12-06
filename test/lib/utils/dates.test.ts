import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import { formatFirebaseTimestampToShowDateTime } from '@/lib/utils/dates'; // Adjusted path

describe('formatFirebaseTimestampToShowDateTime', () => {
  it('should format a Firebase Timestamp to a Spanish locale string for a specific date', () => {
    // Arrange: Set up the test data. We need a predictable starting point.
    // We'll use a fixed date: Christmas Day 2025, at 8:30 AM.
    const testDate = new Date('2025-12-25T08:30:00');
    const firebaseTimestamp = Timestamp.fromDate(testDate);

    // Act: Call the function we are testing.
    const formattedDate = formatFirebaseTimestampToShowDateTime(firebaseTimestamp);

    // Assert: Check if the output is what we expect.
    // The output of toLocaleString can vary slightly based on the Node.js version and ICU data.
    // So we check for the essential parts.
    expect(formattedDate).toContain('25 de diciembre de 2025');

    // This part can be tricky with timezones, so let's check for the hour.
    // Depending on the test runner's environment timezone, it might be '8:30' or '08:30'.
    // A regex helps us be more flexible.
    expect(formattedDate).toMatch(/8:30|08:30/);
  });

  it('should handle another date correctly', () => {
    // Arrange
    const testDate = new Date('2024-01-15T22:00:00');
    const firebaseTimestamp = Timestamp.fromDate(testDate);

    // Act
    const formattedDate = formatFirebaseTimestampToShowDateTime(firebaseTimestamp);

    // Assert
    expect(formattedDate).toContain('15 de enero de 2024');
    expect(formattedDate).toMatch(/10:00|22:00/);
  });
});
