/**
 * Modern Date & Timestamp Formatting Utilities for Bela Rate & Costing Manager
 */

export interface FormattedTimestamp {
  formattedDate: string;
  formattedTime: string;
  full: string;
  iso: string;
}

export function formatModernTimestamp(dateInput?: string | number | Date): FormattedTimestamp {
  const d = dateInput ? new Date(dateInput) : new Date();

  if (isNaN(d.getTime())) {
    return {
      formattedDate: String(dateInput || 'N/A'),
      formattedTime: '',
      full: String(dateInput || 'N/A'),
      iso: new Date().toISOString()
    };
  }

  const formattedDate = d.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }); // e.g. "12 Aug 2026"

  const formattedTime = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }); // e.g. "06:27:45 PM"

  return {
    formattedDate,
    formattedTime,
    full: `${formattedDate} • ${formattedTime}`,
    iso: d.toISOString()
  };
}

export function resolveAssetUrl(url?: string): string {
  if (!url) return '/ecopanel_preview.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  if (url.startsWith('/uploads')) {
    return `http://localhost:5000${url}`;
  }
  return url;
}
