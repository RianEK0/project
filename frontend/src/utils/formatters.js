export const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const formatTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getFullImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const backendOrigin = import.meta.env.VITE_BACKEND_ORIGIN || '';
  return `${backendOrigin}${path}`;
};
