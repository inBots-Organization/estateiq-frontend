'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { brainApi, type BrainDocument, type ContentLevel } from '@/lib/api/brain.api';
import {
  Brain,
  Upload,
  Trash2,
  FileText,
  FileType,
  File,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  AlertTriangle,
  HardDrive,
  GraduationCap,
  Sparkles,
  User,
} from 'lucide-react';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string, isRTL: boolean): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
    case 'docx': return <FileType className="w-5 h-5 text-blue-500" />;
    default: return <File className="w-5 h-5 text-gray-500" />;
  }
}

function getStatusBadge(status: string, isRTL: boolean) {
  switch (status) {
    case 'processing':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Clock className="w-3 h-3 mr-1 animate-spin" />
          {isRTL ? 'جاري المعالجة' : 'Processing'}
        </Badge>
      );
    case 'ready':
      return (
        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          {isRTL ? 'جاهز' : 'Ready'}
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          {isRTL ? 'فشل' : 'Failed'}
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getLevelBadge(level: ContentLevel, isRTL: boolean) {
  const config: Record<ContentLevel, { label: string; labelAr: string; color: string }> = {
    beginner: { label: 'Beginner', labelAr: 'مبتدئ', color: 'bg-green-100 text-green-700 border-green-200' },
    intermediate: { label: 'Intermediate', labelAr: 'متوسط', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    advanced: { label: 'Advanced', labelAr: 'متقدم', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    professional: { label: 'Professional', labelAr: 'محترف', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    general: { label: 'General', labelAr: 'عام', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  };
  const c = config[level] || config.general;
  return (
    <Badge variant="outline" className={cn('text-xs', c.color)}>
      <GraduationCap className="w-3 h-3 mr-1" />
      {isRTL ? c.labelAr : c.label}
    </Badge>
  );
}

const TEACHER_PERSONAS = [
  { id: 'ahmed', name: 'أحمد', nameEn: 'Ahmed', level: 'beginner' },
  { id: 'noura', name: 'نورة', nameEn: 'Noura', level: 'intermediate' },
  { id: 'anas', name: 'أنس', nameEn: 'Anas', level: 'advanced' },
  { id: 'abdullah', name: 'عبدالله', nameEn: 'Abdullah', level: 'professional' },
];

export default function AdminBrainPage() {
  const { isRTL } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<BrainDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<globalThis.File | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<ContentLevel>('general');
  const [selectedPersona, setSelectedPersona] = useState<string>('');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brainApi.listDocuments();
      setDocuments(data.documents);
    } catch (err) {
      console.error('Failed to fetch brain documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Poll for processing documents
  useEffect(() => {
    const processingDocs = documents.filter(d => d.status === 'processing');
    if (processingDocs.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const data = await brainApi.listDocuments();
        setDocuments(data.documents);

        const stillProcessing = data.documents.some(d => d.status === 'processing');
        if (!stillProcessing) clearInterval(interval);
      } catch {
        // Silent retry
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documents]);

  const openUploadModal = (file: globalThis.File) => {
    setPendingFile(file);
    setSelectedLevel('general');
    setSelectedPersona('');
    setUploadModalOpen(true);
  };

  const handleConfirmUpload = async () => {
    if (!pendingFile) return;

    try {
      setUploading(true);
      setError(null);
      setUploadModalOpen(false);

      await brainApi.uploadDocument(pendingFile, {
        contentLevel: selectedLevel,
        targetPersona: selectedPersona || undefined,
      });

      await fetchDocuments();
      setPendingFile(null);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) openUploadModal(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) openUploadModal(file);
  };

  const handleDelete = async (docId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا المستند؟' : 'Are you sure you want to delete this document?')) return;
    try {
      setDeleting(docId);
      await brainApi.deleteDocument(docId);
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      console.error('Delete failed:', err);
      setError(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filteredDocs = documents.filter(doc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return doc.title.toLowerCase().includes(q) || doc.fileName.toLowerCase().includes(q);
  });

  const totalChunks = documents.reduce((sum, d) => sum + d.chunkCount, 0);
  const readyDocs = documents.filter(d => d.status === 'ready').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className={cn('p-6 space-y-6 max-w-5xl mx-auto', isRTL && 'text-right')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-violet-500" />
            {isRTL ? 'العقل الذكي' : 'AI Brain'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'قاعدة المعرفة لتدريب الذكاء الاصطناعي' : 'Knowledge base for AI training'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-violet-600">{documents.length}</div>
            <div className="text-xs text-muted-foreground">{isRTL ? 'المستندات' : 'Documents'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-emerald-600">{readyDocs}</div>
            <div className="text-xs text-muted-foreground">{isRTL ? 'جاهز' : 'Ready'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalChunks}</div>
            <div className="text-xs text-muted-foreground">{isRTL ? 'أجزاء' : 'Chunks'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto text-red-700">
            &times;
          </Button>
        </div>
      )}

      {/* Upload Zone */}
      <Card>
        <CardContent className="pt-6">
          <div
            className={cn(
              'border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
              dragActive
                ? 'border-violet-500 bg-violet-50'
                : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50',
              uploading && 'opacity-60 pointer-events-none'
            )}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
                <p className="text-sm text-muted-foreground">{isRTL ? 'جاري الرفع...' : 'Uploading...'}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-violet-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-violet-600" />
                </div>
                <div>
                  <p className="font-medium">{isRTL ? 'اسحب ملفاً هنا أو انقر للاختيار' : 'Drag a file here or click to select'}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isRTL ? 'PDF, DOCX, TXT — حد أقصى 25 ميجابايت' : 'PDF, DOCX, TXT — Max 25MB'}
                  </p>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Document List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              {isRTL ? 'المستندات' : 'Documents'} ({documents.length})
            </CardTitle>
            {documents.length > 0 && (
              <div className="relative w-64">
                <Search className={cn('absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground', isRTL ? 'right-3' : 'left-3')} />
                <Input
                  placeholder={isRTL ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn('h-9', isRTL ? 'pr-9' : 'pl-9')}
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>{isRTL ? 'لا توجد مستندات مرفوعة بعد' : 'No documents uploaded yet'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                >
                  {/* File Icon */}
                  <div className="flex-shrink-0">
                    {getFileIcon(doc.fileType)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{doc.title}</span>
                      {doc.isSystemDefault && (
                        <Badge variant="secondary" className="text-xs">
                          {isRTL ? 'افتراضي' : 'System'}
                        </Badge>
                      )}
                      {getLevelBadge(doc.contentLevel, isRTL)}
                      {doc.targetPersona && (
                        <Badge variant="outline" className="text-xs bg-violet-50 text-violet-700 border-violet-200">
                          <User className="w-3 h-3 mr-1" />
                          {TEACHER_PERSONAS.find(p => p.id === doc.targetPersona)?.[isRTL ? 'name' : 'nameEn'] || doc.targetPersona}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{doc.fileName}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      {doc.chunkCount > 0 && (
                        <span>{doc.chunkCount} {isRTL ? 'جزء' : 'chunks'}</span>
                      )}
                      <span>{formatDate(doc.createdAt, isRTL)}</span>
                    </div>
                    {doc.status === 'failed' && doc.errorMessage && (
                      <p className="text-xs text-red-500 mt-1">{doc.errorMessage}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(doc.status, isRTL)}
                  </div>

                  {/* Delete */}
                  {!doc.isSystemDefault && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-muted-foreground hover:text-red-500"
                      onClick={() => handleDelete(doc.id)}
                      disabled={deleting === doc.id}
                    >
                      {deleting === doc.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Options Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className={cn('sm:max-w-md', isRTL && 'text-right')}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              {isRTL ? 'إعدادات المستند' : 'Document Settings'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File info */}
            {pendingFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-8 h-8 text-violet-500" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{pendingFile.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(pendingFile.size)}</p>
                </div>
              </div>
            )}

            {/* Content Level */}
            <div className="space-y-2">
              <Label>{isRTL ? 'مستوى المحتوى' : 'Content Level'}</Label>
              <Select value={selectedLevel} onValueChange={(v) => setSelectedLevel(v as ContentLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{isRTL ? 'عام (للجميع)' : 'General (All levels)'}</SelectItem>
                  <SelectItem value="beginner">{isRTL ? 'مبتدئ (الأساسيات)' : 'Beginner (Basics)'}</SelectItem>
                  <SelectItem value="intermediate">{isRTL ? 'متوسط' : 'Intermediate'}</SelectItem>
                  <SelectItem value="advanced">{isRTL ? 'متقدم' : 'Advanced'}</SelectItem>
                  <SelectItem value="professional">{isRTL ? 'محترف (تأهيل احترافي)' : 'Professional'}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {isRTL
                  ? 'المعلم الذكي سيستخدم هذا المحتوى للطلاب في هذا المستوى'
                  : 'AI Teacher will use this content for students at this level'}
              </p>
            </div>

            {/* Target Persona (optional) */}
            <div className="space-y-2">
              <Label>{isRTL ? 'المعلم المستهدف (اختياري)' : 'Target Teacher (Optional)'}</Label>
              <Select value={selectedPersona} onValueChange={setSelectedPersona}>
                <SelectTrigger>
                  <SelectValue placeholder={isRTL ? 'اختر معلم...' : 'Select teacher...'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{isRTL ? 'الكل' : 'All Teachers'}</SelectItem>
                  {TEACHER_PERSONAS.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {isRTL ? p.name : p.nameEn} ({isRTL ?
                        (p.level === 'beginner' ? 'مبتدئ' : p.level === 'intermediate' ? 'متوسط' : p.level === 'advanced' ? 'متقدم' : 'محترف')
                        : p.level})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className={cn(isRTL && 'flex-row-reverse')}>
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button onClick={handleConfirmUpload} disabled={uploading}>
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {isRTL ? 'رفع المستند' : 'Upload Document'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
