import {
  SPREADSHEET_ID,
  FORM_RESPONSE_URL,
  FORM_ENTRY_IDS,
} from '../data/quranData';
import { TOTAL_QURAN_VERSES } from '../data/quranSurahData';
import { calculateMemberVerseProgress } from '../utils/quranVerseCalculator';
import type { SubmissionData, SheetRow, DashboardMetrics, MemberContribution } from '../types';
import { getAccessToken } from './auth';

/**
 * Parses Google Visualization JSON format into typed SheetRow array.
 */
export async function fetchSheetData(): Promise<SheetRow[]> {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&_=${Date.now()}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status} when fetching sheet data`);
    }
    const text = await response.text();
    // Extract JSON from google.visualization.Query.setResponse(...)
    const jsonStart = text.indexOf('{');
    const jsonEnd = text.lastIndexOf('}');
    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error('Invalid format returned from Google Sheets');
    }
    const rawJson = text.substring(jsonStart, jsonEnd + 1);
    const parsed = JSON.parse(rawJson);
    const rows = parsed.table?.rows || [];

    const sheetRows: SheetRow[] = rows
      .map((r: { c: Array<{ v: any; f?: string } | null> }, index: number) => {
        const c = r.c || [];
        // Col 0: Timestamp
        const timestampVal = c[0]?.f || c[0]?.v || '';
        let rawDate = new Date();
        if (typeof c[0]?.v === 'string' && c[0]?.v.startsWith('Date(')) {
          // Parse Date(yyyy,m,d,h,m,s)
          const parts = c[0].v.replace('Date(', '').replace(')', '').split(',').map(Number);
          if (parts.length >= 3) {
            rawDate = new Date(parts[0], parts[1], parts[2], parts[3] || 0, parts[4] || 0, parts[5] || 0);
          }
        } else if (timestampVal) {
          const parsedD = new Date(timestampVal);
          if (!isNaN(parsedD.getTime())) rawDate = parsedD;
        }

        const nama = String(c[1]?.v || '').trim();
        const kegiatan = String(c[2]?.v || '').trim();
        const surat = String(c[3]?.v || '').trim();
        const ayat = String(c[4]?.v || '').trim();
        const iqro = String(c[5]?.v || '').trim();
        const halaman = String(c[6]?.v || '').trim();
        const sholawatRaw = c[7]?.v ?? c[7]?.f ?? 0;
        const sholawat = typeof sholawatRaw === 'number' ? sholawatRaw : Number(String(sholawatRaw).replace(/[^0-9]/g, '')) || 0;
        const catatanKecil = String(c[8]?.v || '').trim();

        return {
          id: `row-${index}-${timestampVal}`,
          timestamp: timestampVal || rawDate.toLocaleString('id-ID'),
          nama: nama || 'Anonim',
          kegiatan: kegiatan || 'Tilawah',
          surat: surat || '-',
          ayat: ayat || '-',
          iqro,
          halaman,
          sholawat,
          catatanKecil,
          rawDate,
        };
      })
      .filter((row: SheetRow) => row.nama !== 'Anonim' || row.surat !== '-' || row.sholawat > 0);

    return sheetRows.reverse(); // Newest first
  } catch (err) {
    console.error('Error fetching sheet data:', err);
    throw err;
  }
}

/**
 * Submits form data to Google Form & Google Sheets.
 * If signed in with OAuth token, attempts Google Sheets API v4 append directly,
 * and always submits to the Google Form response endpoint to ensure live automatic syncing.
 */
export async function submitLaporan(
  data: SubmissionData
): Promise<{ success: boolean; method: 'sheets_api' | 'google_form' | 'both' }> {
  let submittedViaSheetsApi = false;
  let submittedViaForm = false;

  const accessToken = await getAccessToken();

  // 1. Try Google Sheets API append if access token is available
  if (accessToken) {
    try {
      const now = new Date();
      const formattedTimestamp = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/'Form Responses 1'!A:I:append?valueInputOption=USER_ENTERED`;

      const response = await fetch(appendUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [
            [
              formattedTimestamp,
              data.nama,
              data.kegiatan,
              data.surat,
              data.ayat,
              '', // Iqro
              '', // Halaman
              Number(data.sholawat) || 0,
              data.catatanKecil || '',
            ],
          ],
        }),
      });

      if (response.ok) {
        submittedViaSheetsApi = true;
      } else {
        console.warn('Google Sheets API append response not ok:', response.status, await response.text());
      }
    } catch (err) {
      console.warn('Google Sheets API append error, will fallback to Form submission:', err);
    }
  }

  // 2. Submit to the official Google Form (which is connected to this exact Google Sheet)
  try {
    const formData = new URLSearchParams();
    formData.append(FORM_ENTRY_IDS.nama, data.nama);
    formData.append(FORM_ENTRY_IDS.kegiatan, data.kegiatan);
    formData.append(FORM_ENTRY_IDS.surat, data.surat);
    formData.append(FORM_ENTRY_IDS.ayat, data.ayat);
    const standardPresets = ['50', '100', '500', '1000'];
    const sholawatStr = String(data.sholawat);
    if (standardPresets.includes(sholawatStr)) {
      formData.append(FORM_ENTRY_IDS.sholawat, sholawatStr);
    } else {
      // Google Forms radio button with "Other:" field requires __other_option__ and other_option_response
      formData.append(FORM_ENTRY_IDS.sholawat, '__other_option__');
      formData.append(`${FORM_ENTRY_IDS.sholawat}.other_option_response`, sholawatStr);
    }
    formData.append(FORM_ENTRY_IDS.catatanKecil, data.catatanKecil || '');

    // Submit with mode: 'no-cors' so browser executes POST to Google Forms
    await fetch(FORM_RESPONSE_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    submittedViaForm = true;
  } catch (err) {
    console.error('Error posting to Google Form:', err);
    if (!submittedViaSheetsApi) {
      throw err;
    }
  }

  const method = submittedViaSheetsApi && submittedViaForm ? 'both' : submittedViaSheetsApi ? 'sheets_api' : 'google_form';
  return { success: true, method };
}

/**
 * Computes dashboard statistics from rows.
 */
export function computeDashboardMetrics(rows: SheetRow[]): DashboardMetrics {
  const totalSubmissions = rows.length;
  let totalSholawat = 0;
  const uniqueMembers = new Set<string>();
  const surahCounts: Record<string, number> = {};
  const kegiatanCounts: Record<string, number> = {
    Tilawah: 0,
    "Mustami'": 0,
    Terjemah: 0,
  };
  const memberRowsMap: Record<string, SheetRow[]> = {};

  const today = new Date();
  let todaySubmissions = 0;

  // Daily trend mapping for last 14 days
  const dailyMap: Record<string, { count: number; sholawat: number; dateObj: Date }> = {};

  rows.forEach((r) => {
    totalSholawat += r.sholawat;
    if (r.nama) uniqueMembers.add(r.nama);

    // Kegiatan
    const keg = r.kegiatan?.trim() || 'Tilawah';
    if (kegiatanCounts[keg] !== undefined) {
      kegiatanCounts[keg]++;
    } else {
      kegiatanCounts[keg] = (kegiatanCounts[keg] || 0) + 1;
    }

    // Surah
    if (r.surat && r.surat !== '-' && r.surat.trim() !== '') {
      surahCounts[r.surat] = (surahCounts[r.surat] || 0) + 1;
    }

    // Today
    const rDate = r.rawDate;
    if (
      rDate.getFullYear() === today.getFullYear() &&
      rDate.getMonth() === today.getMonth() &&
      rDate.getDate() === today.getDate()
    ) {
      todaySubmissions++;
    }

    // Collect rows per member for verse delta calculation
    const memberName = r.nama || 'Anonim';
    if (!memberRowsMap[memberName]) {
      memberRowsMap[memberName] = [];
    }
    memberRowsMap[memberName].push(r);

    // Daily key: YYYY-MM-DD
    const dateKey = `${rDate.getFullYear()}-${String(rDate.getMonth() + 1).padStart(2, '0')}-${String(rDate.getDate()).padStart(2, '0')}`;
    if (!dailyMap[dateKey]) {
      dailyMap[dateKey] = { count: 0, sholawat: 0, dateObj: rDate };
    }
    dailyMap[dateKey].count++;
    dailyMap[dateKey].sholawat += r.sholawat;
  });

  // Top Surah
  let topSurah = { name: '-', count: 0 };
  Object.entries(surahCounts).forEach(([name, count]) => {
    if (count > topSurah.count) {
      topSurah = { name, count };
    }
  });

  // Surah rankings
  const surahRankings = Object.entries(surahCounts)
    .map(([surah, count]) => ({ surah, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Calculate verse progress per member & sort by total verses read!
  let totalVersesRead = 0;
  const memberContributions: MemberContribution[] = Object.entries(memberRowsMap)
    .map(([name, mRows]) => {
      const prog = calculateMemberVerseProgress(mRows);
      totalVersesRead += prog.totalVerses;
      return {
        name,
        totalVerses: prog.totalVerses,
        estimatedJuz: prog.estimatedJuz,
        estimatedPages: prog.estimatedPages,
        lastPosition: prog.lastPosition,
        tilawahCount: prog.totalSubmissions,
        totalSholawat: prog.totalSholawat,
        lastActive: prog.lastActive,
      };
    })
    .sort(
      (a, b) =>
        b.totalVerses - a.totalVerses ||
        b.tilawahCount - a.tilawahCount ||
        b.totalSholawat - a.totalSholawat
    );

  const estimatedTotalJuz = Math.min(
    30,
    Number((totalVersesRead / (TOTAL_QURAN_VERSES / 30)).toFixed(1))
  );

  // Daily trends sorted by date
  const sortedDates = Object.keys(dailyMap).sort();
  // Take the most recent 14 active days
  const recentDateKeys = sortedDates.slice(-14);
  const dailyTrends = recentDateKeys.map((key) => {
    const item = dailyMap[key];
    const d = item.dateObj;
    const displayDate = `${d.getDate()} ${d.toLocaleDateString('id-ID', { month: 'short' })}`;
    return {
      date: key,
      displayDate,
      count: item.count,
      sholawat: item.sholawat,
    };
  });

  return {
    totalSubmissions,
    totalSholawat,
    totalUniqueMembers: uniqueMembers.size,
    totalVersesRead,
    estimatedTotalJuz,
    topSurah,
    todaySubmissions,
    kegiatanCounts,
    memberContributions,
    dailyTrends,
    surahRankings,
  };
}
