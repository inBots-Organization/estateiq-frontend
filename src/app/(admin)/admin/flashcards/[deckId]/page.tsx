'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import type { DeckDetail, CardDetail, CreateCardInput } from '@/types/flashcard';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Save,
  Loader2,
  Layers,
  BookOpen,
  Pencil,
} from 'lucide-react';

export default function EditDeckPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const deckId = params.deckId as string;

  const [deck, setDeck] = useState<DeckDetail | null>(null);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New card form
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCard, setNewCard] = useState<CreateCardInput>({
    front: '', frontAr: '', back: '', backAr: '', hint: '', hintAr: '', orderInDeck: 0,
  });
  const [addingCard, setAddingCard] = useState(false);

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setLoading(true);
        const data = await flashcardApi.getDeckForAdmin(deckId);
        setDeck(data);
        setTitle(data.title);
        setTitleAr(data.titleAr || '');
        setDescription(data.description || '');
        setDescriptionAr(data.descriptionAr || '');
        setCategory(data.category || '');
      } catch (err) {
        console.error('Failed to fetch deck:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeck();
  }, [deckId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await flashcardApi.updateDeck(deckId, {
        title: title.trim(),
        titleAr: titleAr.trim() || null,
        description: description.trim() || null,
        descriptionAr: descriptionAr.trim() || null,
        category: category.trim() || null,
      });
      setDeck(updated);
    } catch (err) {
      console.error('Failed to update deck:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCard = async () => {
    if (!newCard.front.trim() || !newCard.back.trim()) return;
    try {
      setAddingCard(true);
      const card = await flashcardApi.addCardToDeck(deckId, {
        ...newCard,
        orderInDeck: deck?.cards.length || 0,
      });
      setDeck(prev => prev ? {
        ...prev,
        cards: [...prev.cards, card],
        cardCount: prev.cardCount + 1,
      } : prev);
      setNewCard({ front: '', frontAr: '', back: '', backAr: '', hint: '', hintAr: '', orderInDeck: 0 });
      setShowNewCard(false);
    } catch (err) {
      console.error('Failed to add card:', err);
    } finally {
      setAddingCard(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await flashcardApi.deleteCard(cardId);
      setDeck(prev => prev ? {
        ...prev,
        cards: prev.cards.filter(c => c.id !== cardId),
        cardCount: prev.cardCount - 1,
      } : prev);
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">{isRTL ? 'المجموعة غير موجودة' : 'Deck not found'}</p>
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6 max-w-4xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/flashcards')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-6 h-6 text-amber-500" />
            {t.flashcard.editDeck}
          </h1>
          <p className="text-gray-500 mt-1">{deck.title}</p>
        </div>
      </div>

      {/* Deck Metadata */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {isRTL ? 'تفاصيل المجموعة' : 'Deck Details'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'العنوان (English)' : 'Title (English)'} *
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </label>
              <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'الوصف (English)' : 'Description (English)'}
              </label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <Input value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.flashcard.category}
              </label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t.flashcard.cards} ({deck.cards.length})
          </h3>
          <Button variant="outline" size="sm" onClick={() => setShowNewCard(!showNewCard)}>
            <Plus className="w-4 h-4 mr-1" />
            {t.flashcard.addCard}
          </Button>
        </div>

        {/* New Card Form */}
        {showNewCard && (
          <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10">
            <CardContent className="p-4 space-y-3">
              <h4 className="text-sm font-medium text-amber-700">{t.flashcard.addCard}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder={`${t.flashcard.front} (EN) *`}
                  value={newCard.front}
                  onChange={(e) => setNewCard(prev => ({ ...prev, front: e.target.value }))}
                />
                <Input
                  placeholder={`${t.flashcard.front} (AR)`}
                  value={newCard.frontAr || ''}
                  onChange={(e) => setNewCard(prev => ({ ...prev, frontAr: e.target.value }))}
                  dir="rtl"
                />
                <Input
                  placeholder={`${t.flashcard.back} (EN) *`}
                  value={newCard.back}
                  onChange={(e) => setNewCard(prev => ({ ...prev, back: e.target.value }))}
                />
                <Input
                  placeholder={`${t.flashcard.back} (AR)`}
                  value={newCard.backAr || ''}
                  onChange={(e) => setNewCard(prev => ({ ...prev, backAr: e.target.value }))}
                  dir="rtl"
                />
                <Input
                  placeholder={`${t.flashcard.hint} (EN)`}
                  value={newCard.hint || ''}
                  onChange={(e) => setNewCard(prev => ({ ...prev, hint: e.target.value }))}
                />
                <Input
                  placeholder={`${t.flashcard.hint} (AR)`}
                  value={newCard.hintAr || ''}
                  onChange={(e) => setNewCard(prev => ({ ...prev, hintAr: e.target.value }))}
                  dir="rtl"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => setShowNewCard(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleAddCard}
                  disabled={addingCard || !newCard.front.trim() || !newCard.back.trim()}
                >
                  {addingCard ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                  {t.flashcard.addCard}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Existing Cards */}
        {deck.cards.map((card, index) => (
          <Card key={card.id} className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    <div>
                      <span className="text-xs font-medium text-amber-600">{t.flashcard.front}:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{card.front}</p>
                      {card.frontAr && <p className="text-xs text-gray-500" dir="rtl">{card.frontAr}</p>}
                    </div>
                    <div>
                      <span className="text-xs font-medium text-green-600">{t.flashcard.back}:</span>
                      <p className="text-sm text-gray-900 dark:text-white">{card.back}</p>
                      {card.backAr && <p className="text-xs text-gray-500" dir="rtl">{card.backAr}</p>}
                    </div>
                  </div>
                  {card.hint && (
                    <p className="text-xs text-gray-400 mt-1">
                      {t.flashcard.hint}: {card.hint}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 shrink-0"
                  onClick={() => handleDeleteCard(card.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {deck.cards.length === 0 && (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{isRTL ? 'لا توجد بطاقات بعد' : 'No cards yet'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
