import React from 'react';
import { analyzeQueryMask } from '../utils/search';

interface HighlightTextProps {
  text: string;
  query: string;
  className?: string;
  highlightClassName?: string;
}

export const HighlightText: React.FC<HighlightTextProps> = ({
  text,
  query,
  className = '',
  highlightClassName = 'bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-semibold px-0.5 rounded-xs transition-colors',
}) => {
  if (!text) return null;
  const trimmed = query.trim();
  if (!trimmed) {
    return <span className={className}>{text}</span>;
  }

  // Handle masked queries: extract stem (e.g. "Qcl" from "QclXXXX")
  const maskInfo = analyzeQueryMask(trimmed);
  const targetStem = maskInfo.stem.trim();

  if (!targetStem) {
    return <span className={className}>{text}</span>;
  }

  // Safe escape for regex
  const escaped = targetStem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');

  const parts = text.split(regex);

  if (parts.length === 1) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const isMatch = part.toLowerCase() === targetStem.toLowerCase();
        return isMatch ? (
          <mark key={index} className={highlightClassName}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </span>
  );
};
