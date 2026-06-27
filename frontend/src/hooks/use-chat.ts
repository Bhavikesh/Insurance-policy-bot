import { useMutation } from '@tanstack/react-query';
import { queryAPI } from '../api/endpoints';
import type { QueryPayload } from '../types/chat';

export function useChatQuery() {
  return useMutation({
    mutationFn: (payload: QueryPayload) => queryAPI.process(payload)
  });
}
