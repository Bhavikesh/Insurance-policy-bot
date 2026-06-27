import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { documentsAPI } from '../api/endpoints';

export function useDocuments() {
  return useQuery({
    queryKey: ['documents'],
    queryFn: documentsAPI.getAll,
    staleTime: 30000,
    retry: 2
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: documentsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}
