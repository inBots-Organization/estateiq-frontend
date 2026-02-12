import { apiClient } from './client';

// ─── Types ────────────────────────────────────────────────

export type BrainDocumentStatus = 'uploading' | 'processing' | 'ready' | 'failed';

export type ContentLevel = 'beginner' | 'intermediate' | 'advanced' | 'professional' | 'general';

export interface BrainDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  status: BrainDocumentStatus;
  chunkCount: number;
  isSystemDefault: boolean;
  uploadedBy: string;
  errorMessage?: string | null;
  contentLevel: ContentLevel;
  targetPersona?: string | null;
  teacherId?: string | null;
  tags: string[];
  createdAt: string;
}

export interface BrainDocumentListResponse {
  documents: BrainDocument[];
  total: number;
  page: number;
  totalPages: number;
}

export interface BrainUploadResponse {
  documentId: string;
  title: string;
  status: 'processing';
}

export interface BrainQueryResult {
  content: string;
  score: number;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
}

export interface BrainQueryResponse {
  results: BrainQueryResult[];
  totalChunksSearched: number;
}

export interface BrainDocumentStatusResponse {
  id: string;
  status: BrainDocumentStatus;
  chunkCount: number;
  errorMessage?: string | null;
}

// ─── API ──────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem('auth_token');
  if (!token) {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token || null;
      }
    } catch { /* ignore */ }
  }
  return token || '';
}

export const brainApi = {
  // ─── Documents ────────────────────────────────────────

  /** List documents for current org */
  listDocuments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    includeDefaults?: boolean;
  }): Promise<BrainDocumentListResponse> => {
    const queryParams: Record<string, string> = {};
    if (params?.page) queryParams.page = String(params.page);
    if (params?.limit) queryParams.limit = String(params.limit);
    if (params?.status) queryParams.status = params.status;
    if (params?.includeDefaults === false) queryParams.includeDefaults = 'false';
    return apiClient.get<BrainDocumentListResponse>('/brain/documents', queryParams);
  },

  /** Upload a document (uses FormData for multipart) */
  uploadDocument: async (
    file: File,
    options?: {
      contentLevel?: ContentLevel;
      targetPersona?: string;
      teacherId?: string;
      tags?: string[];
    }
  ): Promise<BrainUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.contentLevel) formData.append('contentLevel', options.contentLevel);
    if (options?.targetPersona) formData.append('targetPersona', options.targetPersona);
    if (options?.teacherId) formData.append('teacherId', options.teacherId);
    if (options?.tags?.length) formData.append('tags', JSON.stringify(options.tags));

    const response = await fetch(`${API_BASE}/brain/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed' }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  /** Delete a document */
  deleteDocument: async (documentId: string): Promise<{ deleted: boolean; chunksRemoved: number }> => {
    return apiClient.delete<{ deleted: boolean; chunksRemoved: number }>(`/brain/documents/${documentId}`);
  },

  /** Get document processing status */
  getDocumentStatus: async (documentId: string): Promise<BrainDocumentStatusResponse> => {
    return apiClient.get<BrainDocumentStatusResponse>(`/brain/documents/${documentId}/status`);
  },

  // ─── Query ──────────────────────────────────────────

  /** Query the brain (RAG retrieval) */
  queryBrain: async (query: string, topK?: number): Promise<BrainQueryResponse> => {
    return apiClient.post<BrainQueryResponse>('/brain/query', {
      query,
      topK: topK || 5,
    });
  },
};
