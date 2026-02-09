'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { flashcardApi } from '@/lib/api/flashcard.api';
import type { CreateCardInput } from '@/types/flashcard';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Loader2,
  Layers,
  BookOpen,
} from 'lucide-react';

export default function CreateDeckPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [category, setCategory] = useState('');
  const [cards, setCards] = useState<CreateCardInput[]>([
    { front: '', frontAr: '', back: '', backAr: '', hint: '', hintAr: '', orderInDeck: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  // AI Generation
  const [aiTopic, setAiTopic] = useState('');
  const [aiCount, setAiCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  const addCard = () => {
    setCards(prev => [...prev, {
      front: '', frontAr: '', back: '', backAr: '', hint: '', hintAr: '',
      orderInDeck: prev.length,
    }]);
  };

  const removeCard = (index: number) => {
    setCards(prev => prev.filter((_, i) => i !== index).map((c, i) => ({ ...c, orderInDeck: i })));
  };

  const updateCard = (index: number, field: keyof CreateCardInput, value: string) => {
    setCards(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    if (!title.trim() || cards.length === 0) return;
    const validCards = cards.filter(c => c.front.trim() && c.back.trim());
    if (validCards.length === 0) return;

    try {
      setSaving(true);
      await flashcardApi.createDeck({
        title: title.trim(),
        titleAr: titleAr.trim() || null,
        description: description.trim() || null,
        descriptionAr: descriptionAr.trim() || null,
        category: category.trim() || null,
        cards: validCards,
      });
      router.push('/admin/flashcards');
    } catch (err) {
      console.error('Failed to create deck:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const deck = await flashcardApi.generateDeck({
        topic: aiTopic.trim() || undefined,
        numberOfCards: aiCount,
      });
      // Populate form with generated data
      setTitle(deck.title);
      setTitleAr(deck.titleAr || '');
      setDescription(deck.description || '');
      setDescriptionAr(deck.descriptionAr || '');
      setCards(deck.cards.map((c, i) => ({
        front: c.front,
        frontAr: c.frontAr || '',
        back: c.back,
        backAr: c.backAr || '',
        hint: c.hint || '',
        hintAr: c.hintAr || '',
        orderInDeck: i,
      })));
    } catch (err) {
      console.error('Failed to generate:', err);
    } finally {
      setGenerating(false);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <div className={cn('p-6 space-y-6 max-w-4xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/admin/flashcards')}>
          <BackIcon className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-amber-500" />
            {t.flashcard.createDeck}
          </h1>
        </div>
      </div>

      {/* AI Generation Panel */}
      <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900 dark:text-purple-200">
              {t.flashcard.generateWithAI}
            </h3>
          </div>
          <div className="flex gap-3">
            <Input
              placeholder={t.flashcard.topic}
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder={t.flashcard.numberOfCards}
              value={aiCount}
              onChange={(e) => setAiCount(Math.max(3, Math.min(50, parseInt(e.target.value) || 10)))}
              className="w-24"
              min={3}
              max={50}
            />
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              {t.flashcard.generate}
            </Button>
          </div>
        </CardContent>
      </Card>

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
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Deck title" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
              </label>
              <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="عنوان المجموعة" dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'الوصف (English)' : 'Description (English)'}
              </label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
              </label>
              <Input value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} placeholder="الوصف" dir="rtl" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.flashcard.category}
              </label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. fundamentals" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Builder */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {t.flashcard.cards} ({cards.length})
          </h3>
          <Button variant="outline" size="sm" onClick={addCard}>
            <Plus className="w-4 h-4 mr-1" />
            {t.flashcard.addCard}
          </Button>
        </div>

        {cards.map((card, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  {t.flashcard.card} #{index + 1}
                </Badge>
                {cards.length > 1 && (
                  <Button variant="ghost" size="sm" onClick={() => removeCard(index)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.front} (EN) *</label>
                  <Input
                    value={card.front}
                    onChange={(e) => updateCard(index, 'front', e.target.value)}
                    placeholder="Question / Term"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.front} (AR)</label>
                  <Input
                    value={card.frontAr || ''}
                    onChange={(e) => updateCard(index, 'frontAr', e.target.value)}
                    placeholder="السؤال / المصطلح"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.back} (EN) *</label>
                  <Input
                    value={card.back}
                    onChange={(e) => updateCard(index, 'back', e.target.value)}
                    placeholder="Answer / Definition"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.back} (AR)</label>
                  <Input
                    value={card.backAr || ''}
                    onChange={(e) => updateCard(index, 'backAr', e.target.value)}
                    placeholder="الإجابة / التعريف"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.hint} (EN)</label>
                  <Input
                    value={card.hint || ''}
                    onChange={(e) => updateCard(index, 'hint', e.target.value)}
                    placeholder="Optional hint"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500">{t.flashcard.hint} (AR)</label>
                  <Input
                    value={card.hintAr || ''}
                    onChange={(e) => updateCard(index, 'hintAr', e.target.value)}
                    placeholder="تلميح اختياري"
                    dir="rtl"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-4">
        <Button variant="outline" onClick={() => router.push('/admin/flashcards')}>
          {isRTL ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button
          className="bg-amber-500 hover:bg-amber-600 text-white"
          onClick={handleSave}
          disabled={saving || !title.trim() || cards.filter(c => c.front.trim() && c.back.trim()).length === 0}
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {t.flashcard.createDeck}
        </Button>
      </div>
    </div>
  );
}
