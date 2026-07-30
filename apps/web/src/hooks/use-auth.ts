import { useQuery } from '@tanstack/react-query';

import { apiClient } from '@/services/api/client';

export function useCurrentUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => apiClient.get('/auth/me'),
    retry: false,
  });
}

