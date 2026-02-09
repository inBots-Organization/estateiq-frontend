'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import type { DeckListItem } from '@/types/flashcard';
import {
  Plus,
  Layers,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  Loader2,
} from 'lucide-react';

export default function AdminFlashcardsPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [decks, setDecks] = useState<DeckListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      const data = await flashcardApi.getAdminDecks();
      setDecks(data.decks);
    } catch (err) {
      console.error('Failed to fetch decks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (deckId: string, publish: boolean) => {
    try {
      await flashcardApi.publishDeck(deckId, publish);
      setDecks(prev => prev.map(d => d.id === deckId ? { ...d, isPublished: publish } : d));
    } catch (err) {
      console.error('Failed to toggle publish:', err);
    }
  };

  const handleDelete = async (deckId: string) => {
    if (!confirm(t.flashcard.confirmDeleteDesc)) return;
    try {
      setDeleting(deckId);
      await flashcardApi.deleteDeck(deckId);
      setDecks(prev => prev.filter(d => d.id !== deckId));
    } catch (err) {
      console.error('Failed to delete deck:', err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6 max-w-5xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-amber-500" />
            {t.flashcard.manageDecks}
          </h1>
          <p className="text-gray-500 mt-1">
            {decks.length} {t.flashcard.decks}
          </p>
        </div>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={() => router.push('/admin/flashcards/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.flashcard.createDeck}
        </Button>
      </div>

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <div className="text-center py-16">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">{t.flashcard.noDecks}</h3>
          <Button
            className="mt-4 bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => router.push('/admin/flashcards/create')}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t.flashcard.createDeck}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decks.map((deck) => (
            <Card key={deck.id} className="hover:shadow-md transition-shadow overflow-hidden">
              <div className={cn(
                'h-2',
                deck.isPublished
                  ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                  : 'bg-gradient-to-r from-gray-300 to-gray-400'
              )} />
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {isRTL && deck.titleAr ? deck.titleAr : deck.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {isRTL && deck.descriptionAr ? deck.descriptionAr : deck.description}
                    </p>
                  </div>
                  <Badge className={cn(
                    'text-xs shrink-0',
                    deck.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {deck.isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {deck.cardCount} {t.flashcard.cards}
                  </span>
                  {deck.category && (
                    <Badge variant="outline" className="text-xs">{deck.category}</Badge>
                  )}
                  {deck.generationType === 'ai_generated' && (
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/flashcards/${deck.id}`)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    {t.flashcard.editDeck}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePublish(deck.id, !deck.isPublished)}
                  >
                    {deck.isPublished ? (
                      <><EyeOff className="w-3.5 h-3.5 mr-1" />{t.flashcard.unpublishDeck}</>
                    ) : (
                      <><Eye className="w-3.5 h-3.5 mr-1" />{t.flashcard.publishDeck}</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                    disabled={deleting === deck.id}
                    onClick={() => handleDelete(deck.id)}
                  >
                    {deleting === deck.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
