function normalizeCopy(copy: string): string {
  return copy.replace(/\s+/g, ' ').trim();
}

export function compactCopy(copy: string, maxLength = 120): string {
  const normalized = normalizeCopy(copy);

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const sentences = normalized
    .match(/[^.!?]+[.!?]?/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean);

  const firstSentence = sentences?.[0];

  if (firstSentence && firstSentence.length <= maxLength) {
    return firstSentence;
  }

  const slice = normalized.slice(0, maxLength + 1).trim();
  const lastBreakpoint = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf(', '),
    slice.lastIndexOf(' '),
  );
  const safeBreakpoint =
    lastBreakpoint > Math.floor(maxLength * 0.6) ? lastBreakpoint : maxLength;

  return `${slice.slice(0, safeBreakpoint).trim()}...`;
}
