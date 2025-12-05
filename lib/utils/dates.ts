import { Timestamp } from 'firebase/firestore';

export function formatTimestapToFirebaseTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
}

export function formatFirebaseTimestampToShowDateTime(timestamp: Timestamp): string {
    const date = timestamp.toDate();
    return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}