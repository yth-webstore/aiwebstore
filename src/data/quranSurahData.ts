export interface SurahMeta {
  number: number;
  name: string;
  transliteration: string;
  totalAyat: number;
  startGlobalIndex: number; // 1-based index of first verse in Quran
  endGlobalIndex: number;   // 1-based index of last verse in Quran
}

// 114 Surahs of the Holy Quran with canonical verse counts (Total: 6,236 verses)
export const QURAN_SURAHS: SurahMeta[] = (() => {
  const surahRaw: [number, string, number][] = [
    [1, "Al-Fatihah", 7],
    [2, "Al-Baqarah", 286],
    [3, "Ali 'Imran", 200],
    [4, "An-Nisa", 176],
    [5, "Al-Ma'idah", 120],
    [6, "Al-An'am", 165],
    [7, "Al-A'raf", 206],
    [8, "Al-Anfal", 75],
    [9, "At-Taubah", 129],
    [10, "Yunus", 109],
    [11, "Hud", 123],
    [12, "Yusuf", 111],
    [13, "Ar-Ra'd", 43],
    [14, "Ibrahim", 52],
    [15, "Al-Hijr", 99],
    [16, "An-Nahl", 128],
    [17, "Al-Isra", 111],
    [18, "Al-Kahfi", 110],
    [19, "Maryam", 98],
    [20, "Taha", 135],
    [21, "Al-Anbiya", 112],
    [22, "Al-Hajj", 78],
    [23, "Al-Mu'minun", 118],
    [24, "An-Nur", 64],
    [25, "Al-Furqan", 77],
    [26, "Asy-Syu'ara", 227],
    [27, "An-Naml", 93],
    [28, "Al-Qashash", 88],
    [29, "Al-'Ankabut", 69],
    [30, "Ar-Rum", 60],
    [31, "Luqman", 34],
    [32, "As-Sajdah", 30],
    [33, "Al-Ahzab", 73],
    [34, "Saba'", 54],
    [35, "Fatir", 45],
    [36, "Yasin", 83],
    [37, "As-Saffat", 182],
    [38, "Sad", 88],
    [39, "Az-Zumar", 75],
    [40, "Ghafir", 85],
    [41, "Fussilat", 54],
    [42, "Asy-Syura", 53],
    [43, "Az-Zukhruf", 89],
    [44, "Ad-Dukhan", 59],
    [45, "Al-Jatsiyah", 37],
    [46, "Al-Ahqaf", 35],
    [47, "Muhammad", 38],
    [48, "Al-Fath", 29],
    [49, "Al-Hujurat", 18],
    [50, "Qaf", 45],
    [51, "Az-Zariyat", 60],
    [52, "At-Tur", 49],
    [53, "An-Najm", 62],
    [54, "Al-Qamar", 55],
    [55, "Ar-Rahman", 78],
    [56, "Al-Waqi'ah", 96],
    [57, "Al-Hadid", 29],
    [58, "Al-Mujadilah", 22],
    [59, "Al-Hasyr", 24],
    [60, "Al-Mumtahanah", 13],
    [61, "As-Saff", 14],
    [62, "Al-Jumu'ah", 11],
    [63, "Al-Munafiqun", 11],
    [64, "At-Taghabun", 18],
    [65, "At-Talaq", 12],
    [66, "At-Tahrim", 12],
    [67, "Al-Mulk", 30],
    [68, "Al-Qalam", 52],
    [69, "Al-Haqqah", 52],
    [70, "Al-Ma'arij", 44],
    [71, "Nuh", 28],
    [72, "Al-Jinn", 28],
    [73, "Al-Muzzammil", 20],
    [74, "Al-Muddassir", 56],
    [75, "Al-Qiyamah", 40],
    [76, "Al-Insan", 31],
    [77, "Al-Mursalat", 50],
    [78, "An-Naba'", 40],
    [79, "An-Nazi'at", 46],
    [80, "'Abasa", 42],
    [81, "At-Takwir", 29],
    [82, "Al-Infitar", 19],
    [83, "Al-Mutaffifin", 36],
    [84, "Al-Insyiqaq", 25],
    [85, "Al-Buruj", 22],
    [86, "At-Tariq", 17],
    [87, "Al-A'la", 19],
    [88, "Al-Ghasyiyah", 26],
    [89, "Al-Fajr", 30],
    [90, "Al-Balad", 20],
    [91, "Asy-Syams", 15],
    [92, "Al-Lail", 21],
    [93, "Ad-Duha", 11],
    [94, "Asy-Syarh", 8],
    [95, "At-Tin", 8],
    [96, "Al-'Alaq", 19],
    [97, "Al-Qadr", 5],
    [98, "Al-Bayyinah", 8],
    [99, "Az-Zalzalah", 8],
    [100, "Al-'Adiyat", 11],
    [101, "Al-Qari'ah", 11],
    [102, "At-Takasur", 8],
    [103, "Al-'Asr", 3],
    [104, "Al-Humazah", 9],
    [105, "Al-Fil", 5],
    [106, "Quraisy", 4],
    [107, "Al-Ma'un", 7],
    [108, "Al-Kausar", 3],
    [109, "Al-Kafirun", 6],
    [110, "An-Nasr", 3],
    [111, "Al-Lahab", 5],
    [112, "Al-Ikhlas", 4],
    [113, "Al-Falaq", 5],
    [114, "An-Nas", 6],
  ];

  let cumulative = 0;
  return surahRaw.map(([num, name, count]) => {
    const start = cumulative + 1;
    cumulative += count;
    return {
      number: num,
      name,
      transliteration: name,
      totalAyat: count,
      startGlobalIndex: start,
      endGlobalIndex: cumulative,
    };
  });
})();

export const TOTAL_QURAN_VERSES = 6236;

/**
 * Normalizes surah strings for fuzzy and resilient matching.
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Finds a SurahMeta by number or string representation (e.g. "1 Al-Fatihah", "Al-Baqarah", "36 Yasin").
 */
export function findSurah(surahQuery: string): SurahMeta | undefined {
  if (!surahQuery) return undefined;
  const trimmed = surahQuery.trim();

  // Try extracting starting number: e.g. "1 Al-Fatihah", "36 Yasin", "2"
  const leadMatch = trimmed.match(/^(\d+)\b/);
  if (leadMatch) {
    const num = parseInt(leadMatch[1], 10);
    if (num >= 1 && num <= 114) {
      return QURAN_SURAHS[num - 1];
    }
  }

  // Exact or normalized match against name
  const normQuery = normalizeName(trimmed);
  if (!normQuery) return undefined;

  // Direct find
  const found = QURAN_SURAHS.find((s) => {
    const sNorm = normalizeName(s.name);
    return (
      sNorm === normQuery ||
      normQuery.includes(sNorm) ||
      sNorm.includes(normQuery)
    );
  });

  return found;
}

/**
 * Parses user input in the "ayat" field.
 * Handles formats: "1-10", "1 - 10", "1 s/d 10", "100", "akhir", "khatam", etc.
 */
export function parseAyatRange(
  ayatInput: string | undefined,
  totalSurahAyat: number
): { start: number; end: number; isRange: boolean } {
  if (!ayatInput) {
    return { start: 1, end: 1, isRange: false };
  }

  const clean = ayatInput.trim().toLowerCase();

  // Check for keywords like "akhir", "khatam", "selesai", "full", "semua"
  if (
    clean.includes('akhir') ||
    clean.includes('khatam') ||
    clean.includes('selesai') ||
    clean.includes('full')
  ) {
    return { start: 1, end: totalSurahAyat, isRange: true };
  }

  // Check for range pattern: "1-10", "1 - 10", "1 sd 10", "1 s/d 10", "1 sampai 10"
  const rangeMatch = clean.match(/(\d+)\s*(?:-|–|—|s\/?d|sampai|to)\s*(\d+)/i);
  if (rangeMatch) {
    let start = parseInt(rangeMatch[1], 10);
    let end = parseInt(rangeMatch[2], 10);
    if (isNaN(start) || start < 1) start = 1;
    if (isNaN(end) || end < start) end = start;
    if (end > totalSurahAyat) end = totalSurahAyat;
    return { start, end, isRange: true };
  }

  // Check for single number: "100", "ayat 100", "25"
  const numMatch = clean.match(/\b(\d+)\b/);
  if (numMatch) {
    let val = parseInt(numMatch[1], 10);
    if (isNaN(val) || val < 1) val = 1;
    if (val > totalSurahAyat) val = totalSurahAyat;
    return { start: val, end: val, isRange: false };
  }

  return { start: 1, end: 1, isRange: false };
}

/**
 * Returns the global 1-based verse index in the Quran (1..6236).
 */
export function getGlobalVerseIndex(surahNum: number, verseNum: number): number {
  if (surahNum < 1 || surahNum > 114) return 1;
  const surah = QURAN_SURAHS[surahNum - 1];
  const boundedVerse = Math.min(Math.max(1, verseNum), surah.totalAyat);
  return surah.startGlobalIndex + (boundedVerse - 1);
}
