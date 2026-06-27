import apiClient from './client';
import type { DocumentItem, QueryAnswerResponse, QueryPayload } from '../types/chat';

export interface DocumentsResponse {
  documents: DocumentItem[];
}

export const documentsAPI = {
  async getAll(): Promise<DocumentsResponse> {
    const response = await apiClient.get('/documents/');
    return response.data;
  },

  async getById(docId: string): Promise<DocumentItem> {
    const response = await apiClient.get(`/documents/${docId}`);
    return response.data;
  },

  async delete(docId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/documents/${docId}`);
    return response.data;
  }
};

export const uploadAPI = {
  async uploadFile(file: File, company?: string): Promise<{ document: DocumentItem }> {
    const formData = new FormData();
    formData.append('file', file);
    if (company) {
      formData.append('company', company);
    }

    const response = await apiClient.post('/upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  }
};

export const queryAPI = {
  async process(payload: QueryPayload): Promise<QueryAnswerResponse> {
    const response = await apiClient.post('/hackrx/run', payload);
    return response.data;
  }
};
