/**
 * Standard Nepali & South Asian Numbering & Currency Formatting Utilities
 * Handles:
 * 1. ASCII to Devanagari / Nepali numerals conversion (1,2,3 -> १,२,३)
 * 2. South Asian / Nepali currency digit grouping (1,23,456.00)
 * 3. Number-to-Words Conversion in South Asian System (Lakhs & Crores)
 */

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Converts Western digits (0-9) to Devanagari / Nepali digits (०-९)
 */
export function toNepaliDigits(input?: string | number): string {
  if (input === undefined || input === null) return '';
  return String(input).replace(/[0-9]/g, (char) => NEPALI_DIGITS[parseInt(char, 10)]);
}

/**
 * Formats currency in South Asian / Nepali numbering system (e.g. 1,23,456.00)
 */
export function formatNepaliCurrency(
  amount: number | string,
  options: { showSymbol?: boolean; devanagari?: boolean } = { showSymbol: true, devanagari: false }
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  
  // Format using South Asian grouping (en-IN locale gives 1,23,456.00)
  const formatted = num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const prefix = options.showSymbol !== false ? 'NPR ' : '';
  const result = `${prefix}${formatted}`;

  return options.devanagari ? toNepaliDigits(result).replace('NPR', 'रु.') : result;
}

const UNITS = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const TEENS = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanThousand(n: number): string {
  let str = '';
  if (n >= 100) {
    str += `${UNITS[Math.floor(n / 100)]} Hundred `;
    n %= 100;
  }
  if (n >= 10 && n < 20) {
    str += `${TEENS[n - 10]} `;
  } else {
    if (n >= 20) {
      str += `${TENS[Math.floor(n / 10)]} `;
      n %= 10;
    }
    if (n > 0) {
      str += `${UNITS[n]} `;
    }
  }
  return str.trim();
}

/**
 * Converts a numeric amount to written English words using the South Asian / Nepali system (Lakhs & Crores)
 * e.g. 123456 -> "One Lakh Twenty Three Thousand Four Hundred Fifty Six Only"
 */
export function numberToWordsSouthAsian(amount: number | string): string {
  const numVal = Math.floor(Math.abs(typeof amount === 'string' ? parseFloat(amount) || 0 : amount));

  if (numVal === 0) return 'Zero Rupees Only';

  let n = numVal;
  let words = '';

  // Crores (1,00,00,000)
  if (n >= 10000000) {
    const crore = Math.floor(n / 10000000);
    words += `${convertLessThanThousand(crore)} Crore `;
    n %= 10000000;
  }

  // Lakhs (1,00,000)
  if (n >= 100000) {
    const lakh = Math.floor(n / 100000);
    words += `${convertLessThanThousand(lakh)} Lakh `;
    n %= 100000;
  }

  // Thousands (1,000)
  if (n >= 1000) {
    const thousand = Math.floor(n / 1000);
    words += `${convertLessThanThousand(thousand)} Thousand `;
    n %= 1000;
  }

  // Hundreds & Below
  if (n > 0) {
    words += convertLessThanThousand(n);
  }

  const cleanWords = words.trim().replace(/\s+/g, ' ');
  return `Nepalese Rupees ${cleanWords} Only`;
}
