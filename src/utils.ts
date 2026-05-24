/**
 * Helper to convert standard English numbers into Eastern Arabic digits (١، ٢، ٣، ...)
 */
export function toArabicDigits(num: string | number): string {
  const str = String(num);
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[0-9]/g, (w) => arabicDigits[parseInt(w, 10)]);
}

/**
 * Clean currency formatting for Iraqi Dinars
 */
export function formatIraqiDinar(amount: number | string | undefined | null): string {
  if (amount === null || amount === undefined || amount === "") return "";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "";
  
  // Format with localized comma separator
  const formatted = num.toLocaleString("en-US");
  return `${formatted} د.ع`;
}

/**
 * Format date nicely in Arabic (YYYY/MM/DD)
 */
export function formatDateArabic(dateStr: string): { year: string; month: string; day: string } {
  if (!dateStr) return { year: "", month: "", day: "" };
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { year: "", month: "", day: "" };

  const year = String(d.getFullYear()).substring(2); // Get last two digits like 26
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return { year, month, day };
}
