import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import type { Teacher } from '@shared/schema';
import { Loader2, MoreHorizontal, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Group {
  id: string;
  name: string;
  teacher_id: string;
  schedule: string;
  room: string;
  max_students: number;
  current_students: number;
  status: 'active' | 'closed';
  attendance_rate: number;
  monthly_revenue: number;
  created_at?: string;
  updated_at?: string;
  teachers?: { name: string };
}

function GroupsContent() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    teacher_id: '',
    schedule: '',
    room: '',
    max_students: 12,
    current_students: 0,
    status: 'active' as 'active' | 'closed',
    attendance_rate: 85,
    monthly_revenue: 0,
  });
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [groupsRes, teachersRes] = await Promise.all([
        supabase
          .from('groups')
          .select('*, teachers(name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('teachers')
          .select('*')
          .order('name'),
      ]);

      if (groupsRes.error) {
        console.error('Groups error:', groupsRes.error);
        if (groupsRes.error.code === 'PGRST116' || groupsRes.error.message?.includes('does not exist')) {
          toast({
            title: 'Xatolik',
            description: 'Groups jadvali topilmadi. Iltimos, FIX_GROUPS_TABLE.sql faylini Supabase SQL Editor\'da ishga tushiring.',
            variant: 'destructive',
          });
        } else {
          throw groupsRes.error;
        }
        setGroups([]);
      } else {
        setGroups(groupsRes.data || []);
      }

      if (teachersRes.error) {
        console.error('Teachers error:', teachersRes.error);
        toast({
          title: 'Xatolik',
          description: 'O\'qituvchilar yuklanmadi: ' + teachersRes.error.message,
          variant: 'destructive',
        });
        setTeachers([]);
      } else {
        setTeachers(teachersRes.data || []);
      }
    } catch (error: any) {
      toast({
        title: 'Xatolik',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingGroup(null);
    setFormData({
      name: '',
      teacher_id: teachers[0]?.id || '',
      schedule: '',
      room: '',
      max_students: 12,
      current_students: 0,
      status: 'active',
      attendance_rate: 85,
      monthly_revenue: 0,
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formData.teacher_id) {
      toast({ title: 'Ogohlantirish', description: 'Iltimos, ustozni tanlang', variant: 'destructive' });
      return;
    }
    try {
      if (editingGroup) {
        const { error } = await supabase
          .from('groups')
          .update(formData)
          .eq('id', editingGroup.id);

        if (error) throw error;
        toast({ title: 'Yangilandi', description: 'Guruh ma\'lumotlari yangilandi' });
      } else {
        const { error } = await supabase
          .from('groups')
          .insert([formData]);

        if (error) throw error;
        toast({ title: 'Qo\'shildi', description: 'Yangi guruh yaratildi' });
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error(error);
      toast({ title: 'Xatolik', description: error.message || 'Ma\'lumotlarni saqlab bo\'lmadi', variant: 'destructive' });
    }
  };

  const handleEdit = (group: Group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      teacher_id: group.teacher_id,
      schedule: group.schedule,
      room: group.room,
      max_students: group.max_students,
      current_students: group.current_students,
      status: group.status,
      attendance_rate: group.attendance_rate,
      monthly_revenue: group.monthly_revenue,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (group: Group) => {
    if (!confirm(`"${group.name}" guruhini o'chirishni istaysizmi?`)) return;
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', group.id);

      if (error) throw error;
      toast({ title: 'O\'chirildi', description: 'Guruh muvaffaqiyatli o\'chirildi' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Xatolik', description: error.message, variant: 'destructive' });
    }
  };

  const filteredGroups = useMemo(() => {
    return groups
      .filter((group) => (statusFilter === 'all' ? true : group.status === statusFilter))
      .filter((group) => group.name.toLowerCase().includes(searchValue.toLowerCase()));
  }, [groups, statusFilter, searchValue]);

  const stats = useMemo(() => {
    const active = groups.filter((group) => group.status === 'active').length;
    const capacity = groups.reduce(
      (acc, group) => acc + (group.max_students ? group.current_students / group.max_students : 0),
      0
    );
    const avgCapacity = groups.length ? Math.round((capacity / groups.length) * 100) : 0;
    const revenue = groups.reduce((sum, group) => sum + Number(group.monthly_revenue), 0);
    return { total: groups.length, active, closed: groups.length - active, avgCapacity, revenue };
  }, [groups]);

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in-down">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              Guruhlar
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">Guruhlarni boshqaring</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="w-full sm:w-auto text-sm">
                <Plus className="mr-2 h-4 w-4" />
                Yangi guruh
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
              <DialogHeader>
                <DialogTitle>{editingGroup ? 'Guruhni tahrirlash' : 'Yangi guruh yaratish'}</DialogTitle>
                <DialogDescription>Ustoz, jadval va sig\'im ma\'lumotlarini kiriting</DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guruh nomi</Label>
                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Ustoz</Label>
                    <Select
                      value={formData.teacher_id}
                      onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Ustozni tanlang" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.length === 0 ? (
                          <SelectItem value="no-teachers" disabled>
                            O'qituvchilar topilmadi
                          </SelectItem>
                        ) : (
                          teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                              {teacher.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Jadval</Label>
                    <Input value={formData.schedule} onChange={(e) => setFormData({ ...formData, schedule: e.target.value })} placeholder="e.g. Dushanba & Chorshanba — 18:00-20:00" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Xona</Label>
                    <Input value={formData.room} onChange={(e) => setFormData({ ...formData, room: e.target.value })} placeholder="Lab 201" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Maksimal o'quvchilar</Label>
                    <Input
                      type="number"
                      value={formData.max_students}
                      onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'closed' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Attendance (%)</Label>
                    <Input
                      type="number"
                      value={formData.attendance_rate}
                      onChange={(e) => setFormData({ ...formData, attendance_rate: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Bekor qilish
                  </Button>
                  <Button type="submit">
                    {editingGroup ? 'Yangilash' : 'Qo\'shish'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <div className="stagger-item">
            <StatCard title="Jami guruhlar" value={stats.total} note="Yaratilgan bo'limlar" />
          </div>
          <div className="stagger-item">
            <StatCard title="Faol guruhlar" value={stats.active} note="Dars davom etmoqda" accent="text-emerald-600" />
          </div>
          <div className="stagger-item">
            <StatCard title="Yopilgan" value={stats.closed} note="Rejalashtirilgan / yakunlangan" accent="text-amber-600" />
          </div>
          <div className="stagger-item">
            <StatCard title="O'rtacha sig'im" value={`${stats.avgCapacity}%`} note="Bandlik koeffitsienti" />
          </div>
        </div>

        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Guruhlar jadvali</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
            <div className="flex flex-col md:flex-row gap-3">
              <Input
                placeholder="Qidirish..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="md:w-1/3"
              />
              <Select value={statusFilter} onValueChange={(value: 'all' | 'active' | 'closed') => setStatusFilter(value)}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Holat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Barchasi</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Yuklanmoqda...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-[700px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs sm:text-sm">Guruh</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden md:table-cell">Ustoz</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Jadval</TableHead>
                        <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Xona</TableHead>
                        <TableHead className="text-xs sm:text-sm">Sig'im</TableHead>
                        <TableHead className="text-xs sm:text-sm">Status</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Amallar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGroups.map((group, index) => (
                        <TableRow key={group.id} className="table-row-hover stagger-item" style={{ animationDelay: `${index * 0.02}s` }}>
                          <TableCell className="font-semibold text-xs sm:text-sm">
                            <div>
                              <div>{group.name}</div>
                              <div className="md:hidden mt-1 text-xs text-muted-foreground">
                                {(group.teachers as any)?.name || 'Noma\'lum'}
                              </div>
                              <div className="lg:hidden mt-1 text-xs text-muted-foreground">
                                {group.schedule}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs sm:text-sm">{(group.teachers as any)?.name || 'Noma\'lum'}</TableCell>
                          <TableCell className="hidden lg:table-cell text-xs sm:text-sm text-muted-foreground">{group.schedule}</TableCell>
                          <TableCell className="hidden xl:table-cell text-xs sm:text-sm">{group.room}</TableCell>
                          <TableCell className="text-xs sm:text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {group.current_students}/{group.max_students}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {group.max_students ? Math.round((group.current_students / group.max_students) * 100) : 0}% bandlik
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={group.status === 'active' ? 'default' : 'secondary'} className="text-[10px] sm:text-xs">
                              {group.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel className="text-xs">Amallar</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setLocation(`/admin/groups/${group.id}`)} className="text-xs">Tafsilotlar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(group)} className="text-xs">Tahrirlash</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive text-xs" onClick={() => handleDelete(group)}>
                                  O'chirish
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function StatCard({ title, value, note, accent }: { title: string; value: number | string; note: string; accent?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2 p-4 sm:p-6">
        <CardTitle className="text-xs sm:text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <p className={`text-xl sm:text-2xl font-bold break-words ${accent || ''}`}>{value}</p>
        <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{note}</p>
      </CardContent>
    </Card>
  );
}

export default function AdminGroupsPage() {
  return (
    <ProtectedRoute>
      <GroupsContent />
    </ProtectedRoute>
  );
}


