import apiClient from './axios';

export const documentsAPI = {
  getAll: async () => {
    const response = await apiClient.get('/documents/');
    return response.data;
  },

  getById: async (docId) => {
    const response = await apiClient.get(`/documents/${docId}`);
    return response.data;
  },

  delete: async (docId) => {
    const response = await apiClient.delete(`/documents/${docId}`);
    return response.data;
  },
};

export const uploadAPI = {
  uploadFile: async (file, company = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (company) {
      formData.append('company', company);
    }

    const response = await apiClient.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAllowedTypes: async () => {
    const response = await apiClient.get('/upload/allowed-types');
    return response.data;
  },
};

export const queryAPI = {
  processQuery: async (payload) => {
    const response = await apiClient.post('/hackrx/run', payload);
    return response.data;
  },
};

export const healthAPI = {
  check: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  },
};

export default {
  documents: documentsAPI,
  upload: uploadAPI,
  query: queryAPI,
  health: healthAPI,
};