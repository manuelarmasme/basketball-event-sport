import { Timestamp } from 'firebase/firestore';

export function formatFirebaseTimestampToISO(timestamp: Timestamp): string {
    return timestamp.toDate().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export function formatTimestapToFirebaseTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
}