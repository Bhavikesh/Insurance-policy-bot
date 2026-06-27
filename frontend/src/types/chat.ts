export type FileType = 'pdf' | 'docx' | 'eml' | 'unknown';

export interface DocumentItem {
  id: string;
  filename: string;
  display_name: string;
  company: string;
  size: number;
  source: 'dataset' | 'upload';
  path: string;
  uploaded_at: string;
  type?: FileType;
}

export interface Citation {
  clause_id: string;
  page_number: number;
  similarity_score: number;
  highlighted_text: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  citations?: Citation[];
  confidence?: number;
  isStreaming?: boolean;
  error?: string;
}

export interface QueryPayload {
  document_id?: string;
  document_url?: string;
  questions: string[];
}

export interface QueryAnswerResponse {
  answer?: string;
  answers?: string[];
  citations?: Citation[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  updatedAt: string;
}
