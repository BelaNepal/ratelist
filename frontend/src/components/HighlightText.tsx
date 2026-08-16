import React from 'react';

interface HighlightTextProps {
  text: string | number | undefined | null;
  query: string;
  className?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({ text, query, className = '' }) => {
  if (text === undefined || text === null) return null;
  const strText = String(text);

  if (!query || !query.trim()) {
    return <span className={className}>{strText}</span>;
  }

  // Split query into individual tokens (e.g. "t panel 75 2440" -> ["t", "panel", "75", "2440"])
  const tokens = query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  if (tokens.length === 0) {
    return <span className={className}>{strText}</span>;
  }

  // Combine tokens into regex pattern matching any token
  const pattern = `(${tokens.join('|')})`;
  const regex = new RegExp(pattern, 'gi');
  const parts = strText.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = tokens.some((token) => new RegExp(`^${token}$`, 'i').test(part));
        return isMatch ? (
          <mark
            key={index}
            className="bg-amber-100 text-amber-900 font-extrabold px-1 py-0.5 rounded border border-amber-200/80 shadow-2xs"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        );
      })}
    </span>
  );
};
