/* --- Constants -------------------------------------------------------------------------------- */
/* --- Check Persian Leap Year -------------------------------------- */
export const isJalaliLeapYear = (jy: number): boolean => {
  const cycle = jy % 33;
  return [1, 5, 9, 13, 17, 22, 26, 30].includes(cycle);
};
/* --- Gregorian To JD ---------------------------------------------- */
const gregorianToJd = (y: number, m: number, d: number): number => {
  if (m < 3) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4); 
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
};
/* --- JD To Gregorian ---------------------------------------------- */
const jdToGregorian = (jd: number): [number, number, number] => {
  jd += 0.5;
  const z = Math.floor(jd);
  const f = jd - z;

  let a = z;
  if (z >= 2299161) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25);
    a = z + 1 + alpha - Math.floor(alpha / 4);
  }
  const b = a + 1524;
  const c = Math.floor((b - 122.1) / 365.25);
  const d = Math.floor(365.25 * c);
  const e = Math.floor((b - d) / 30.6001);

  const day = b - d - Math.floor(30.6001 * e) + f;
  const month = e < 14 ? e - 1 : e - 13;
  const year = month > 2 ? c - 4716 : c - 4715;

  return [year, month, Math.floor(day)];
};
/* --- Get Jalali Year Start JD ------------------------------------- */
const getJalaliYearStartJd = (jy: number): number => {
  // Year 1 of Jalali calendar started on March 21, 622 AD (not March 22)
  // The actual start is March 21, but we use March 22 as base and adjust
  const baseJd = gregorianToJd(622, 3, 21);
  
  if (jy <= 1) {
    return baseJd;
  }
  
  // Calculate total days from year 1 to year jy-1 (inclusive)
  const yearsBefore = jy - 1;
  
  // Calculate number of complete 33-year cycles
  const cycles = Math.floor(yearsBefore / 33);
  // Remaining years in the current cycle (0 to 32)
  const remainder = yearsBefore % 33;
  
  // Each 33-year cycle has 8 leap years, so total days = 33 * 365 + 8 = 12053
  const cycleDays = cycles * 12053;
  
  // Calculate days in remaining years (from year 1 to year remainder, inclusive)
  let remainderDays = 0;
  for (let year = 1; year <= remainder; year++) {
    remainderDays += isJalaliLeapYear(year) ? 366 : 365;
  }
  
  return baseJd + cycleDays + remainderDays;
};
/* --- Gregorian To Persian ----------------------------------------- */
export const greToPer = (date: string): string => {
  // Trim and normalize separators: convert / to -
  const normalized = date.trim().replace(/\//g, '-');
  
  // Extract date part and time part (handle timestamps like "2025-11-10 05:48:03.025277")
  const parts = normalized.split(/[\sT]/);
  const datePart = parts[0];
  const timePart = parts[1] || '';
  
  const [y, m, d] = datePart.split('-').map(Number);
  const jd = gregorianToJd(y, m, d);

  // Find the Jalali year
  // Start with approximation: year 1 started on March 21, 622
  let jy = Math.floor((jd - gregorianToJd(622, 3, 21)) / 365.2425) + 1;
  if (jy < 1) jy = 1;
  
  // Find exact year by checking year starts
  let jd1 = getJalaliYearStartJd(jy);
  while (jd1 > jd && jy > 1) {
    jy--;
    jd1 = getJalaliYearStartJd(jy);
  }
  
  // Check if date is in next year
  const jd2 = getJalaliYearStartJd(jy + 1);
  if (jd >= jd2) {
    jy++;
    jd1 = jd2;
  }

  const leap = isJalaliLeapYear(jy);
  const daysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leap ? 30 : 29];

  let dayOfYear = Math.floor(jd - jd1) + 1;
  if (dayOfYear < 1) dayOfYear = 1;
  
  let jm = 1;
  while (jm <= 12 && dayOfYear > daysInMonth[jm]) {
    dayOfYear -= daysInMonth[jm];
    jm++;
  }
  
  if (jm > 12) {
    jm = 12;
    dayOfYear = daysInMonth[12];
  }

  const jalaliDate = `${jy}-${String(jm).padStart(2, '0')}-${String(dayOfYear).padStart(2, '0')}`;
  return timePart ? `${jalaliDate} ${timePart}` : jalaliDate;
};
/* --- Persian To Gregorian ----------------------------------------- */
export const perToGre = (date: string): string => {
  // Trim and normalize separators: convert / to -
  const normalized = date.trim().replace(/\//g, '-');
  
  // Extract date part and time part (handle timestamps like "1369-03-02 01:02:03.012345")
  const parts = normalized.split(/[\sT]/);
  const datePart = parts[0];
  const timePart = parts[1] || '';
  
  // Parse date part (now normalized to use - separator)
  const [y, m, d] = datePart.split('-').map(Number);
  const leap = isJalaliLeapYear(y);
  const daysInMonth = [0, 31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, leap ? 30 : 29];

  let dayOfYear = d;
  for (let i = 1; i < m; i++) {
    dayOfYear += daysInMonth[i];
  }

  const jd1 = getJalaliYearStartJd(y);
  const jd = jd1 + dayOfYear - 1;
  const [gy, gm, gd] = jdToGregorian(jd);

  const gregorianDate = `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`;
  return timePart ? `${gregorianDate} ${timePart}` : gregorianDate;
};
