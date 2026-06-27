import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadAPI } from '../api/endpoints';

export function useUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ file, company }: { file: File; company?: string }) => uploadAPI.uploadFile(file, company),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });
}
