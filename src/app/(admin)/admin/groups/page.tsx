'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAdminRoleSafe } from '@/contexts/AdminRoleContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  UsersRound,
  Plus,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Users,
  GraduationCap,
  Loader2,
  Trash2,
  Edit,
} from 'lucide-react';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
}

interface Group {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  memberCount: number;
  trainerCount: number;
  trainers: Trainer[];
}

export default function GroupsPage() {
  const { token } = useAuthStore();
  const { isRTL } = useLanguage();
  const { isTrainer, isOrgAdmin, permissions } = useAdminRoleSafe();
  const [isLoading, setIsLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDescription, setNewGroupDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Trainers cannot create or delete groups
  const canCreateGroups = permissions?.canCreateGroups ?? isOrgAdmin;
  const canDeleteGroups = permissions?.canDeleteGroups ?? isOrgAdmin;

  // Helper to get token
  const getAuthToken = useCallback((): string | null => {
    if (token) return token;
    try {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
      }
    } catch (e) {
      console.error('Failed to parse auth-storage:', e);
    }
    return null;
  }, [token]);

  const fetchGroups = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      // Use /admin/groups endpoint which filters for trainers automatically
      const response = await fetch(`${apiUrl}/admin/groups`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;

    const authToken = getAuthToken();
    if (!authToken) return;

    setIsCreating(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/groups`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGroupName.trim(),
          description: newGroupDescription.trim() || null,
        }),
      });

      if (response.ok) {
        setNewGroupName('');
        setNewGroupDescription('');
        setIsCreateDialogOpen(false);
        fetchGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create group');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      alert('Failed to create group');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذه المجموعة؟' : 'Are you sure you want to delete this group?')) {
      return;
    }

    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroups();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete group');
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
  };

  const filteredGroups = groups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            {isTrainer && <UsersRound className="h-6 w-6 text-teal-500" />}
            {isTrainer
              ? (isRTL ? 'مجموعاتي' : 'My Groups')
              : (isRTL ? 'المجموعات' : 'Groups')
            }
          </h1>
          <p className="text-muted-foreground mt-1">
            {isTrainer
              ? (isRTL ? 'المجموعات المعينة لك والطلاب فيها' : 'Groups assigned to you and their students')
              : (isRTL ? 'إدارة مجموعات المتدربين والمدربين' : 'Manage trainee groups and trainer assignments')
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isTrainer && (
            <Badge variant="outline" className="px-3 py-1.5 bg-teal-500/10 border-teal-500/30 text-teal-500">
              {isRTL ? 'عرض المدرب' : 'Trainer View'}
            </Badge>
          )}
          <Button variant="outline" onClick={fetchGroups} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            {isRTL ? 'تحديث' : 'Refresh'}
          </Button>
          {canCreateGroups && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 bg-violet-500 hover:bg-violet-600">
                  <Plus className="h-4 w-4" />
                  {isRTL ? 'مجموعة جديدة' : 'New Group'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isRTL ? 'إنشاء مجموعة جديدة' : 'Create New Group'}</DialogTitle>
                  <DialogDescription>
                    {isRTL
                      ? 'أضف مجموعة جديدة لتنظيم المتدربين'
                      : 'Add a new group to organize trainees'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'اسم المجموعة' : 'Group Name'}
                    </label>
                    <Input
                      placeholder={isRTL ? 'مثال: دفعة المبيعات - الربع الأول' : 'e.g., Sales Batch - Q1'}
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'الوصف (اختياري)' : 'Description (optional)'}
                    </label>
                    <Input
                      placeholder={isRTL ? 'وصف المجموعة' : 'Group description'}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button
                    onClick={handleCreateGroup}
                    disabled={!newGroupName.trim() || isCreating}
                    className="bg-violet-500 hover:bg-violet-600"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </>
                    ) : (
                      isRTL ? 'إنشاء' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search */}
      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="relative">
            <Search
              className={cn(
                'absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground',
                isRTL ? 'right-3' : 'left-3'
              )}
            />
            <Input
              placeholder={isRTL ? 'البحث عن مجموعة...' : 'Search groups...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(isRTL ? 'pr-10' : 'pl-10')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isTrainer ? "from-teal-500/10" : "from-violet-500/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isTrainer ? "bg-teal-500/20" : "bg-violet-500/20"
              )}>
                <UsersRound className={cn("h-5 w-5", isTrainer ? "text-teal-500" : "text-violet-500")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{groups.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isTrainer
                    ? (isRTL ? 'مجموعاتي' : 'My Groups')
                    : (isRTL ? 'إجمالي المجموعات' : 'Total Groups')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-border bg-gradient-to-br to-transparent",
          isTrainer ? "from-cyan-500/10" : "from-blue-500/10"
        )}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl",
                isTrainer ? "bg-cyan-500/20" : "bg-blue-500/20"
              )}>
                <Users className={cn("h-5 w-5", isTrainer ? "text-cyan-500" : "text-blue-500")} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {groups.reduce((acc, g) => acc + g.memberCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isTrainer
                    ? (isRTL ? 'طلابي' : 'My Students')
                    : (isRTL ? 'إجمالي المتدربين' : 'Total Trainees')
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-gradient-to-br from-emerald-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <GraduationCap className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(groups.flatMap((g) => g.trainers.map((t) => t.id))).size}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'المدربين المعينين' : 'Assigned Trainers'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Groups List */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isTrainer
              ? (isRTL ? 'المجموعات المعينة لي' : 'Groups Assigned to Me')
              : (isRTL ? 'جميع المجموعات' : 'All Groups')
            }
          </CardTitle>
          <CardDescription>
            {filteredGroups.length} {isRTL ? 'مجموعة' : 'groups found'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredGroups.length > 0 ? (
            <div className="space-y-3">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-white",
                      isTrainer
                        ? "bg-gradient-to-br from-teal-500 to-cyan-600"
                        : "bg-gradient-to-br from-violet-500 to-purple-600"
                    )}>
                      <UsersRound className="h-6 w-6" />
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{group.name}</p>
                        {!group.isActive && (
                          <Badge variant="outline" className="text-xs">
                            {isRTL ? 'غير نشط' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
                      </p>
                    </div>
                  </div>

                  {/* Stats and Actions */}
                  <div className="flex items-center gap-6">
                    <div className="text-center hidden md:block">
                      <p className="text-sm font-semibold text-foreground">{group.memberCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'متدرب' : 'Trainees'}
                      </p>
                    </div>

                    <div className="text-center hidden md:block">
                      <p className="text-sm font-semibold text-foreground">{group.trainerCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'مدرب' : 'Trainers'}
                      </p>
                    </div>

                    {group.trainers.length > 0 && (
                      <div className="hidden lg:flex -space-x-2">
                        {group.trainers.slice(0, 3).map((trainer) => (
                          <div
                            key={trainer.id}
                            className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-medium border-2 border-background"
                            title={`${trainer.firstName} ${trainer.lastName}`}
                          >
                            {trainer.firstName[0]}
                            {trainer.lastName[0]}
                          </div>
                        ))}
                        {group.trainers.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium border-2 border-background">
                            +{group.trainers.length - 3}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/admin/groups/${group.id}`}>
                        <Button variant="outline" size="sm">
                          {isTrainer ? (isRTL ? 'عرض' : 'View') : (isRTL ? 'إدارة' : 'Manage')}
                        </Button>
                      </Link>
                      {canDeleteGroups && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersRound className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm
                  ? (isRTL ? 'لم يتم العثور على مجموعات' : 'No groups found')
                  : isTrainer
                    ? (isRTL ? 'لم يتم تعيين أي مجموعات لك بعد' : 'No groups assigned to you yet')
                    : (isRTL ? 'لا توجد مجموعات حتى الآن' : 'No groups yet')
                }
              </p>
              {!searchTerm && canCreateGroups && (
                <Button
                  variant="link"
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="mt-2 text-violet-500"
                >
                  {isRTL ? 'إنشاء أول مجموعة' : 'Create your first group'}
                </Button>
              )}
              {!searchTerm && isTrainer && (
                <p className="text-sm text-muted-foreground mt-2">
                  {isRTL
                    ? 'تواصل مع مسؤول المؤسسة لتعيينك في مجموعة'
                    : 'Contact your organization admin to be assigned to a group'}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
