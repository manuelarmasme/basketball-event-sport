'use server'

interface GoogleSheetsResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

// Cached function to fetch from Google Sheets
async function fetchParticipantsInternal(googleSheetUrl: string): Promise<string[]> {
  const GOOGLE_SHEETS_API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  
  // Extract sheet ID from URL
  const sheetId = extractSheetId(googleSheetUrl);
  
  // Fetch from Google Sheets API
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Respuestas de formulario 1!B2:B?key=${GOOGLE_SHEETS_API_KEY}`,
    { next: { revalidate: 300 } } // Cache for 5 minutes
  );
  
  if (!response.ok) {
    // throw new Error('Failed to fetch participants from Google Sheets');
    return [];
  }
  
  const data: GoogleSheetsResponse = await response.json();

  
  // Filter out empty arrays and map to PreIncriptionPlayer objects
  const participants: string[] = data.values ? data.values.flat() : [];
    
    console.log('data', participants);
  return participants;
}

export async function fetchParticipants(googleSheetUrl: string) {
  
//   cacheTag('participants', `sheet-${googleSheetUrl}`)
  
  return await fetchParticipantsInternal(googleSheetUrl);
}

// Helper to extract sheet ID from URL
function extractSheetId(url: string): string {
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : '';
}