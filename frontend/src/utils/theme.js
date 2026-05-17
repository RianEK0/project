const hexToRgb = (hex = '#1d4ed8') => {
  const normalized = hex.replace('#', '');
  const bigint = parseInt(normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `${r}, ${g}, ${b}`;
};

export const getThemeStyles = (direktorat) => {
  const primary = direktorat?.color || '#1d4ed8';

  return {
    '--primary': primary,
    '--primary-rgb': hexToRgb(primary),
  };
};
