'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuthStore } from '@/stores/auth.store';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import {
  UsersRound,
  ArrowLeft,
  ArrowRight,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Loader2,
  UserPlus,
  UserMinus,
  Edit,
  Save,
  X,
} from 'lucide-react';

interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Member {
  id: string;
  trainee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  joinedAt: string;
  isActive: boolean;
}

interface TrainerAssignment {
  id: string;
  trainer: Trainer;
  assignedAt: string;
  isActive: boolean;
}

interface GroupDetail {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  members: Member[];
  trainerAssignments: TrainerAssignment[];
  _count: {
    members: number;
    trainerAssignments: number;
  };
}

interface AvailableTrainee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupCount: number;
}

interface AvailableTrainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  groupCount: number;
}

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const { isRTL } = useLanguage();
  const groupId = params.id as string;

  // Check if user is admin (org_admin) - trainers should not be able to add/remove
  const isAdmin = user?.role === 'org_admin' || user?.role === 'saas_super_admin';

  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add member dialog
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [availableTrainees, setAvailableTrainees] = useState<AvailableTrainee[]>([]);
  const [selectedTrainees, setSelectedTrainees] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // Add trainer dialog
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [availableTrainers, setAvailableTrainers] = useState<AvailableTrainer[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<string>('');
  const [isAssigningTrainer, setIsAssigningTrainer] = useState(false);

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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

  const fetchGroup = useCallback(async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroup(data.group);
        setEditName(data.group.name);
        setEditDescription(data.group.description || '');
      } else if (response.status === 404) {
        router.push('/admin/groups');
      }
    } catch (err) {
      console.error('Error fetching group:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getAuthToken, apiUrl, groupId, router]);

  const fetchAvailableTrainees = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/groups/available-trainees`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTrainees(data.trainees || []);
      }
    } catch (err) {
      console.error('Error fetching available trainees:', err);
    }
  };

  const fetchAvailableTrainers = async () => {
    const authToken = getAuthToken();
    if (!authToken) return;

    try {
      const response = await fetch(`${apiUrl}/groups/available-trainers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableTrainers(data.trainers || []);
      }
    } catch (err) {
      console.error('Error fetching available trainers:', err);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, [fetchGroup]);

  const handleSaveEdit = async () => {
    const authToken = getAuthToken();
    if (!authToken || !editName.trim()) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update group');
      }
    } catch (err) {
      console.error('Error updating group:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMembers = async () => {
    const authToken = getAuthToken();
    if (!authToken || selectedTrainees.length === 0) return;

    setIsAddingMembers(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ traineeIds: selectedTrainees }),
      });

      if (response.ok) {
        setIsAddMemberOpen(false);
        setSelectedTrainees([]);
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add members');
      }
    } catch (err) {
      console.error('Error adding members:', err);
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleRemoveMember = async (traineeId: string) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    if (!confirm(isRTL ? 'هل أنت متأكد من إزالة هذا المتدرب؟' : 'Are you sure you want to remove this trainee?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/members/${traineeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const handleAssignTrainer = async () => {
    const authToken = getAuthToken();
    if (!authToken || !selectedTrainer) return;

    setIsAssigningTrainer(true);
    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/trainers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainerId: selectedTrainer }),
      });

      if (response.ok) {
        setIsAddTrainerOpen(false);
        setSelectedTrainer('');
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to assign trainer');
      }
    } catch (err) {
      console.error('Error assigning trainer:', err);
    } finally {
      setIsAssigningTrainer(false);
    }
  };

  const handleUnassignTrainer = async (trainerId: string) => {
    const authToken = getAuthToken();
    if (!authToken) return;

    if (!confirm(isRTL ? 'هل أنت متأكد من إلغاء تعيين هذا المدرب؟' : 'Are you sure you want to unassign this trainer?')) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/groups/${groupId}/trainers/${trainerId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchGroup();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to unassign trainer');
      }
    } catch (err) {
      console.error('Error unassigning trainer:', err);
    }
  };

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">{isRTL ? 'المجموعة غير موجودة' : 'Group not found'}</p>
        <Link href="/admin/groups">
          <Button variant="link" className="mt-2">
            {isRTL ? 'العودة للمجموعات' : 'Back to Groups'}
          </Button>
        </Link>
      </div>
    );
  }

  const activeMembers = group.members.filter((m) => m.isActive);
  const activeTrainers = group.trainerAssignments.filter((t) => t.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/groups">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <BackIcon className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-4">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="text-xl font-bold max-w-xs"
              />
              <Button size="sm" onClick={handleSaveEdit} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
              {isAdmin && (
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {!group.isActive && (
                <Badge variant="outline">{isRTL ? 'غير نشط' : 'Inactive'}</Badge>
              )}
            </div>
          )}
          {isEditing ? (
            <Input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder={isRTL ? 'وصف المجموعة' : 'Group description'}
              className="mt-2 max-w-lg"
            />
          ) : (
            <p className="text-muted-foreground mt-1">
              {group.description || (isRTL ? 'لا يوجد وصف' : 'No description')}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/20">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeMembers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'المتدربين' : 'Trainees'}
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
                <p className="text-2xl font-bold text-foreground">{activeTrainers.length}</p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'المدربين' : 'Trainers'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trainers Section */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              {isRTL ? 'المدربين المعينين' : 'Assigned Trainers'}
            </CardTitle>
            <CardDescription>
              {activeTrainers.length} {isRTL ? 'مدرب معين' : 'trainers assigned'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={isAddTrainerOpen}
              onOpenChange={(open) => {
                setIsAddTrainerOpen(open);
                if (open) fetchAvailableTrainers();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  {isRTL ? 'تعيين مدرب' : 'Assign Trainer'}
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? 'تعيين مدرب' : 'Assign Trainer'}</DialogTitle>
                <DialogDescription>
                  {isRTL ? 'اختر مدرب لتعيينه لهذه المجموعة' : 'Select a trainer to assign to this group'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'اختر مدرب' : 'Select trainer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrainers
                      .filter((t) => !activeTrainers.some((at) => at.trainer.id === t.id))
                      .map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.firstName} {trainer.lastName} ({trainer.groupCount} {isRTL ? 'مجموعات' : 'groups'})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddTrainerOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleAssignTrainer}
                  disabled={!selectedTrainer || isAssigningTrainer}
                  className="bg-violet-500 hover:bg-violet-600"
                >
                  {isAssigningTrainer ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    isRTL ? 'تعيين' : 'Assign'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {activeTrainers.length > 0 ? (
            <div className="space-y-2">
              {activeTrainers.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-medium">
                      {assignment.trainer.firstName[0]}
                      {assignment.trainer.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {assignment.trainer.firstName} {assignment.trainer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{assignment.trainer.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleUnassignTrainer(assignment.trainer.id)}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لم يتم تعيين مدربين بعد' : 'No trainers assigned yet'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card className="border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-foreground">
              {isRTL ? 'أعضاء المجموعة' : 'Group Members'}
            </CardTitle>
            <CardDescription>
              {activeMembers.length} {isRTL ? 'متدرب' : 'trainees'}
            </CardDescription>
          </div>
          {isAdmin && (
            <Dialog
              open={isAddMemberOpen}
              onOpenChange={(open) => {
                setIsAddMemberOpen(open);
                if (open) fetchAvailableTrainees();
              }}
            >
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  {isRTL ? 'إضافة متدربين' : 'Add Trainees'}
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{isRTL ? 'إضافة متدربين' : 'Add Trainees'}</DialogTitle>
                <DialogDescription>
                  {isRTL ? 'اختر المتدربين لإضافتهم للمجموعة' : 'Select trainees to add to this group'}
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[300px] overflow-y-auto">
                {availableTrainees
                  .filter((t) => !activeMembers.some((m) => m.trainee.id === t.id))
                  .map((trainee) => (
                    <label
                      key={trainee.id}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTrainees.includes(trainee.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTrainees([...selectedTrainees, trainee.id]);
                          } else {
                            setSelectedTrainees(selectedTrainees.filter((id) => id !== trainee.id));
                          }
                        }}
                        className="rounded"
                      />
                      <div>
                        <p className="font-medium">
                          {trainee.firstName} {trainee.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{trainee.email}</p>
                      </div>
                    </label>
                  ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  onClick={handleAddMembers}
                  disabled={selectedTrainees.length === 0 || isAddingMembers}
                  className="bg-violet-500 hover:bg-violet-600"
                >
                  {isAddingMembers ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    `${isRTL ? 'إضافة' : 'Add'} (${selectedTrainees.length})`
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </CardHeader>
        <CardContent>
          {activeMembers.length > 0 ? (
            <div className="space-y-2">
              {activeMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white font-medium">
                      {member.trainee.firstName[0]}
                      {member.trainee.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.trainee.firstName} {member.trainee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.trainee.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/trainee/${member.trainee.id}/reports`}>
                      <Button variant="outline" size="sm">
                        {isRTL ? 'التقارير' : 'Reports'}
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveMember(member.trainee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              {isRTL ? 'لا يوجد متدربين في هذه المجموعة' : 'No trainees in this group yet'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
