// ---- Card Types ----
export interface CardDetail {
  id: string;
  front: string;
  frontAr: string | null;
  back: string;
  backAr: string | null;
  hint: string | null;
  hintAr: string | null;
  orderInDeck: number;
}

export interface StudyCard {
  id: string;
  front: string;
  frontAr: string | null;
  back: string;
  backAr: string | null;
  hint: string | null;
  hintAr: string | null;
  proficiency: {
    easeFactor: number;
    interval: number;
    repetitions: number;
    quality: number;
    lastReviewedAt: string | null;
  } | null;
}

// ---- Deck Types ----
export interface DeckDetail {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  courseId: string | null;
  category: string | null;
  isPublished: boolean;
  generationType: string;
  cardCount: number;
  cards: CardDetail[];
  createdAt: string;
}

export interface DeckListItem {
  id: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  descriptionAr: string | null;
  courseId: string | null;
  category: string | null;
  isPublished: boolean;
  generationType: string;
  cardCount: number;
  createdAt: string;
}

export interface DeckProgress {
  totalCards: number;
  studiedCards: number;
  masteredCards: number;
  dueCards: number;
}

export interface DeckListItemWithProgress extends DeckListItem {
  progress: DeckProgress;
}

// ---- Review Types ----
export interface ReviewResult {
  cardId: string;
  newEaseFactor: number;
  newInterval: number;
  newRepetitions: number;
  nextReviewDate: string;
  masteryLevel: string;
}

export interface FlashcardProgress {
  totalCards: number;
  studiedCards: number;
  masteredCards: number;
  dueToday: number;
}

// ---- Input Types ----
export interface CreateCardInput {
  front: string;
  frontAr?: string | null;
  back: string;
  backAr?: string | null;
  hint?: string | null;
  hintAr?: string | null;
  orderInDeck: number;
}

export interface UpdateCardInput {
  front?: string;
  frontAr?: string | null;
  back?: string;
  backAr?: string | null;
  hint?: string | null;
  hintAr?: string | null;
  orderInDeck?: number;
}

export interface CreateDeckInput {
  title: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  courseId?: string | null;
  category?: string | null;
  cards: CreateCardInput[];
}

export interface UpdateDeckInput {
  title?: string;
  titleAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  courseId?: string | null;
  category?: string | null;
}

export interface GenerateDeckInput {
  courseId?: string;
  topic?: string;
  numberOfCards?: number;
}
