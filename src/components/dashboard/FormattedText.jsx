import React from 'react';

/**
 * Utility component to render text with proper formatting:
 * 1. Strips stray '**' asterisks and renders '**bold text**' as <strong> tags.
 * 2. Parses markdown links [text](url) and raw URLs into clickable anchor tags.
 * 3. Handles clean line breaks and list item styling.
 */
export const FormattedText = ({ text = '', className = '' }) => {
  if (!text || typeof text !== 'string') return null;

  // Helper to parse links in a snippet of text
  const parseLinks = (snippet) => {
    // Regex for markdown links [text](url) or standalone URLs
    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s)]+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(snippet)) !== null) {
      if (match.index > lastIndex) {
        parts.push(snippet.substring(lastIndex, match.index));
      }

      if (match[1] && match[2]) {
        // [text](url) format
        const label = match[1];
        const url = match[2];
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-900 font-bold underline bg-emerald-50 px-1 py-0.5 rounded transition-colors break-all"
          >
            {label}
          </a>
        );
      } else if (match[3]) {
        // Raw URL format
        const url = match[3];
        // Remove trailing parenthetical punctuation if captured by mistake
        const cleanUrl = url.replace(/[).,]+$/, '');
        parts.push(
          <a
            key={match.index}
            href={cleanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:text-emerald-900 font-bold underline bg-emerald-50 px-1 py-0.5 rounded transition-colors break-all"
          >
            {cleanUrl}
          </a>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < snippet.length) {
      parts.push(snippet.substring(lastIndex));
    }

    return parts.length > 0 ? parts : snippet;
  };

  // Helper to parse bold text **bold**
  const parseBoldAndLinks = (str) => {
    if (!str.includes('**')) {
      return parseLinks(str);
    }

    const boldParts = [];
    const segments = str.split('**');

    segments.forEach((seg, idx) => {
      if (!seg) return;
      // Even index = regular text, Odd index = bold text
      if (idx % 2 === 1) {
        boldParts.push(
          <strong key={idx} className="font-extrabold text-deep-forest">
            {parseLinks(seg)}
          </strong>
        );
      } else {
        boldParts.push(
          <span key={idx}>
            {parseLinks(seg)}
          </span>
        );
      }
    });

    return boldParts;
  };

  // Process text line by line to respect line breaks
  const lines = text.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, lIdx) => {
        // Clean any remaining raw double asterisks if split didn't catch weird edge cases
        const processedLine = line.trim();
        if (!processedLine) return <div key={lIdx} className="h-1" />;

        return (
          <div key={lIdx} className="leading-relaxed">
            {parseBoldAndLinks(processedLine)}
          </div>
        );
      })}
    </div>
  );
};

export default FormattedText;
