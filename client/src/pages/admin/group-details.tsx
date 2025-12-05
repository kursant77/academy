import { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { adminApi } from '@/lib/adminApi';
import type { GroupProfile, StudentProfile } from '@/types/admin';
import { Loader2, ArrowLeft } from 'lucide-react';

function GroupDetailsContent({ groupId }: { groupId: string }) {
  const [, setLocation] = useLocation();
  const [group, setGroup] = useState<GroupProfile | null>(null);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [groupData, members] = await Promise.all([adminApi.getGroup(groupId), adminApi.listGroupStudents(groupId)]);
      setGroup(groupData || null);
      setStudents(members);
      setLoading(false);
    };
    load();
  }, [groupId]);

  if (loading || !group) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Ma'lumotlar yuklanmoqda...
            </>
          ) : (
            'Guruh topilmadi'
          )}
        </div>
      </AdminLayout>
    );
  }

  const capacityPercent = group.maxStudents
    ? Math.min(100, Math.round((group.currentStudents / group.maxStudents) * 100))
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setLocation('/admin/groups')} className="mb-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Barcha guruhlar
            </Button>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-muted-foreground">{group.schedule}</p>
          </div>
          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>{group.status}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <InfoCard title="Ustoz" value={group.teacherName || '—'} note="Mas'ul instruktor" />
          <InfoCard title="Xona" value={group.room} note="Dars o'tiladigan joy" />
          <InfoCard title="Sig'im" value={`${group.currentStudents}/${group.maxStudents}`} note={`${capacityPercent}% bandlik`} />
          <InfoCard title="Attendance" value={`${group.attendanceRate}%`} note="So'nggi oy" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>O'quvchilar ro'yxati</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            {students.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">Bu guruhga hali o'quvchilar biriktirilmagan</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ism</TableHead>
                    <TableHead>Ota-ona</TableHead>
                    <TableHead>Kontakt</TableHead>
                    <TableHead>Oylik to'lov</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-semibold">{student.fullName}</TableCell>
                      <TableCell>{student.parentName}</TableCell>
                      <TableCell>{student.parentContact}</TableCell>
                      <TableCell>{student.monthlyPayment.toLocaleString()} so'm</TableCell>
                      <TableCell>
                        <Badge variant={student.paymentStatus === 'paid' ? 'default' : 'secondary'}>
                          {student.paymentStatus}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

function InfoCard({ title, value, note }: { title: string; value: string | number; note: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{note}</p>
      </CardContent>
    </Card>
  );
}

function GroupDetailsRoute() {
  const [match, params] = useRoute<{ id: string }>('/admin/groups/:id');
  if (!match || !params?.id) {
    return (
      <AdminLayout>
        <div className="py-20 text-center text-muted-foreground">Guruh topilmadi</div>
      </AdminLayout>
    );
  }
  return <GroupDetailsContent groupId={params.id} />;
}

export default function AdminGroupDetailsPage() {
  return (
    <ProtectedRoute>
      <GroupDetailsRoute />
    </ProtectedRoute>
  );
}


