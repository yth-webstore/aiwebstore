import {
  findSurah,
  parseAyatRange,
  getGlobalVerseIndex,
  TOTAL_QURAN_VERSES,
} from '../data/quranSurahData';
import type { SheetRow } from '../types';

export interface MemberVerseProgress {
  totalVerses: number;
  estimatedJuz: number;
  estimatedPages: number;
  lastPosition: string;
  totalSubmissions: number;
  totalSholawat: number;
  lastActive: string;
  lastDate: Date;
}

/**
 * Calculates total verses read by a member across chronological submissions
 * by computing the exact delta between verse reading checkpoints across all 114 surahs.
 */
export function calculateMemberVerseProgress(memberRows: SheetRow[]): MemberVerseProgress {
  if (!memberRows || memberRows.length === 0) {
    return {
      totalVerses: 0,
      estimatedJuz: 0,
      estimatedPages: 0,
      lastPosition: '-',
      totalSubmissions: 0,
      totalSholawat: 0,
      lastActive: '-',
      lastDate: new Date(0),
    };
  }

  // Sort submissions chronologically: oldest first
  const sorted = [...memberRows].sort((a, b) => {
    const timeA = a.rawDate ? a.rawDate.getTime() : 0;
    const timeB = b.rawDate ? b.rawDate.getTime() : 0;
    return timeA - timeB;
  });

  let totalVerses = 0;
  let totalSholawat = 0;
  let lastKnownGlobal: number | null = null;
  let lastKnownLabel = '-';
  let latestActive = sorted[sorted.length - 1]?.timestamp || '-';
  let latestDate = sorted[sorted.length - 1]?.rawDate || new Date(0);

  for (const row of sorted) {
    totalSholawat += row.sholawat || 0;

    const surah = findSurah(row.surat);
    if (!surah) {
      continue;
    }

    const { start, end, isRange } = parseAyatRange(row.ayat, surah.totalAyat);

    if (isRange) {
      // User explicitly gave a range like "1-10", "1 s/d 50", etc.
      const versesInRange = Math.max(1, end - start + 1);
      totalVerses += versesInRange;
      lastKnownGlobal = getGlobalVerseIndex(surah.number, end);
      lastKnownLabel = `QS. ${surah.name}: ${end}`;
    } else {
      // User entered a single checkpoint number like "100", "25", etc.
      const currentGlobal = getGlobalVerseIndex(surah.number, end);

      if (lastKnownGlobal === null) {
        // First entry for this member
        totalVerses += end;
        lastKnownGlobal = currentGlobal;
        lastKnownLabel = `QS. ${surah.name}: ${end}`;
      } else {
        if (currentGlobal > lastKnownGlobal) {
          // Forward progress (e.g. Al-Fatihah 3 -> Al-Baqarah 100)
          const delta = currentGlobal - lastKnownGlobal;
          totalVerses += delta;
        } else if (currentGlobal < lastKnownGlobal) {
          // Backward checkpoint: Check if user completed a full Quran cycle (khatam)
          if (lastKnownGlobal > 5500 && currentGlobal < 1500) {
            // E.g. was at Juz 30 / An-Nas and cycled back to Al-Fatihah / Al-Baqarah
            const delta = (TOTAL_QURAN_VERSES - lastKnownGlobal) + currentGlobal;
            totalVerses += delta;
          } else {
            // Started another non-sequential surah: add verses up to 'end'
            totalVerses += end;
          }
        } else {
          // Exact same verse position reported again
          // Don't add duplicate verses, but if it's an explicit report we acknowledge 1 if total was 0
          if (totalVerses === 0) totalVerses += 1;
        }

        lastKnownGlobal = currentGlobal;
        lastKnownLabel = `QS. ${surah.name}: ${end}`;
      }
    }
  }

  // 1 Juz is ~207.8 verses (6,236 / 30). Standard Madinah Mushaf is 604 pages (~10-12 verses/page).
  const estimatedJuz = Math.min(30, Number((totalVerses / (TOTAL_QURAN_VERSES / 30)).toFixed(1)));
  const estimatedPages = Math.round(totalVerses / 10.3);

  return {
    totalVerses,
    estimatedJuz,
    estimatedPages,
    lastPosition: lastKnownLabel,
    totalSubmissions: sorted.length,
    totalSholawat,
    lastActive: latestActive,
    lastDate: latestDate,
  };
}
