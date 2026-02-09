import { apiClient } from './client';
import type {
  DeckDetail,
  DeckListItem,
  DeckListItemWithProgress,
  CardDetail,
  StudyCard,
  ReviewResult,
  FlashcardProgress,
  CreateDeckInput,
  UpdateDeckInput,
  CreateCardInput,
  UpdateCardInput,
  GenerateDeckInput,
} from '@/types/flashcard';

export const flashcardApi = {
  // ==========================================
  // Trainee endpoints
  // ==========================================

  /** List published decks with progress */
  getAvailableDecks: async (courseId?: string): Promise<{ decks: DeckListItemWithProgress[] }> => {
    const params: Record<string, string> = {};
    if (courseId) params.courseId = courseId;
    return apiClient.get<{ decks: DeckListItemWithProgress[] }>('/flashcards/decks/available', params);
  },

  /** Get due cards for study session */
  getStudyCards: async (deckId: string): Promise<{ cards: StudyCard[]; totalDue: number }> => {
    return apiClient.get<{ cards: StudyCard[]; totalDue: number }>(`/flashcards/decks/${deckId}/study`);
  },

  /** Submit quality rating for a card */
  submitReview: async (cardId: string, quality: number): Promise<ReviewResult> => {
    return apiClient.post<ReviewResult>(`/flashcards/cards/${cardId}/review`, { quality });
  },

  /** Get overall flashcard progress */
  getProgress: async (): Promise<FlashcardProgress> => {
    return apiClient.get<FlashcardProgress>('/flashcards/progress');
  },

  // ==========================================
  // Admin endpoints
  // ==========================================

  /** List all decks (admin view) */
  getAdminDecks: async (): Promise<{ decks: DeckListItem[] }> => {
    return apiClient.get<{ decks: DeckListItem[] }>('/flashcards/decks/manage');
  },

  /** Create deck with cards */
  createDeck: async (data: CreateDeckInput): Promise<DeckDetail> => {
    return apiClient.post<DeckDetail>('/flashcards/decks', data);
  },

  /** Get full deck detail with all cards (admin) */
  getDeckForAdmin: async (deckId: string): Promise<DeckDetail> => {
    return apiClient.get<DeckDetail>(`/flashcards/decks/${deckId}/admin`);
  },

  /** Update deck metadata */
  updateDeck: async (deckId: string, data: UpdateDeckInput): Promise<DeckDetail> => {
    return apiClient.put<DeckDetail>(`/flashcards/decks/${deckId}`, data);
  },

  /** Delete deck */
  deleteDeck: async (deckId: string): Promise<void> => {
    return apiClient.delete(`/flashcards/decks/${deckId}`);
  },

  /** Toggle publish status */
  publishDeck: async (deckId: string, publish: boolean): Promise<void> => {
    return apiClient.patch(`/flashcards/decks/${deckId}/publish`, { publish });
  },

  /** Add card to existing deck */
  addCardToDeck: async (deckId: string, data: CreateCardInput): Promise<CardDetail> => {
    return apiClient.post<CardDetail>(`/flashcards/decks/${deckId}/cards`, data);
  },

  /** Update single card */
  updateCard: async (cardId: string, data: UpdateCardInput): Promise<CardDetail> => {
    return apiClient.put<CardDetail>(`/flashcards/cards/${cardId}`, data);
  },

  /** Delete single card */
  deleteCard: async (cardId: string): Promise<void> => {
    return apiClient.delete(`/flashcards/cards/${cardId}`);
  },

  /** AI-generate deck */
  generateDeck: async (data: GenerateDeckInput): Promise<DeckDetail> => {
    return apiClient.post<DeckDetail>('/flashcards/decks/generate', data);
  },
};
