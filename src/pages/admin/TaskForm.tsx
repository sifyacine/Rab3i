import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ClipboardList, User, Flag, Calendar, Briefcase,
  Save, Loader2, AlertCircle, StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService, TaskPriority, TaskStatus, taskStatusConfig, taskPriorityConfig } from "@/services/tasksService";
import { usersService } from "@/services/usersService";
import { projectsService } from "@/services/projectsService";

const NONE_PROJECT = "none";

const TaskForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("pending");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(NONE_PROJECT);

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: () => usersService.getWorkers(),
  });

  const { data: projectsData } = useQuery({
    queryKey: ["projects-for-tasks"],
    queryFn: () => projectsService.getProjects(),
  });
  const projects = (projectsData?.data ?? []) as Array<{ id: string; title_ar?: string | null; title?: string | null }>;

  const { data: existingTask, isLoading: loadingTask } = useQuery({
    queryKey: ["task", id],
    queryFn: () => tasksService.getTaskById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description ?? "");
      setAssignedTo(existingTask.assigned_to ?? "");
      setPriority(existingTask.priority);
      setStatus(existingTask.status);
      setDueDate(existingTask.due_date ?? "");
      setProjectId(existingTask.project_id ?? NONE_PROJECT);
    }
  }, [existingTask]);

  const createMutation = useMutation({
    mutationFn: () =>
      tasksService.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        assigned_to: assignedTo,
        priority,
        due_date: dueDate || null,
        project_id: projectId === NONE_PROJECT ? null : projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("تم إنشاء المهمة. أخبر الموظف بمراجعة مهامه في لوحة التحكم.");
      navigate("/admin/tasks");
    },
    onError: () => toast.error("حدث خطأ أثناء إنشاء المهمة"),
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      tasksService.updateTask(id!, {
        title: title.trim(),
        description: description.trim() || null,
        assigned_to: assignedTo || null,
        priority,
        status,
        due_date: dueDate || null,
        project_id: projectId === NONE_PROJECT ? null : projectId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["task", id] });
      toast.success("تم تحديث المهمة");
      navigate("/admin/tasks");
    },
    onError: () => toast.error("حدث خطأ أثناء حفظ التعديلات"),
  });

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("يرجى إدخال عنوان المهمة");
      return;
    }
    if (!isEditing && !assignedTo) {
      toast.error("يرجى اختيار الموظف المكلّف بالمهمة");
      return;
    }
    if (isEditing) updateMutation.mutate();
    else createMutation.mutate();
  };

  if (isEditing && loadingTask) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل المهمة" : "مهمة جديدة"}</h1>
        <Button variant="ghost" asChild><Link to="/admin/tasks">إلغاء</Link></Button>
      </div>

      <Card className="border-border/40 bg-card/30">
        <CardHeader>
          <CardTitle>تفاصيل المهمة</CardTitle>
          <CardDescription>سيرى الموظف هذه المهمة في قسم «مهامي» بلوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="task-title">عنوان المهمة</Label>
            <div className="relative">
              <ClipboardList className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="task-title" className="pr-10" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="مثال: تجهيز تصاميم الحملة" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-description">وصف المهمة</Label>
            <Textarea id="task-description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="اشرح المطلوب بالتفصيل..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="task-assignee">الموظف المكلّف</Label>
              <Select value={assignedTo} onValueChange={setAssignedTo}>
                <SelectTrigger id="task-assignee" className="relative pr-10">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {workers.length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">لا يوجد موظفون بعد — أضفهم من قسم المستخدمين</div>
                  )}
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.full_name || w.email}{w.job_title ? ` — ${w.job_title}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-priority">الأولوية</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger id="task-priority" className="relative pr-10">
                  <Flag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(taskPriorityConfig) as TaskPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{taskPriorityConfig[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-due">تاريخ الاستحقاق</Label>
              <div className="relative">
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input id="task-due" type="date" className="pr-10" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="task-project">مشروع مرتبط (اختياري)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger id="task-project" className="relative pr-10">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="بدون مشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_PROJECT}>بدون مشروع</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.title_ar || p.title || p.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Label htmlFor="task-status">الحالة</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
                  <SelectTrigger id="task-status" className="relative pr-10">
                    <Flag className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(taskStatusConfig) as TaskStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{taskStatusConfig[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {isEditing && existingTask?.worker_notes && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 space-y-1 text-sm">
              <p className="flex items-center gap-2 font-semibold text-blue-400"><StickyNote className="h-4 w-4" /> ملاحظات الموظف</p>
              <p className="text-muted-foreground whitespace-pre-wrap">{existingTask.worker_notes}</p>
            </div>
          )}

          {!isEditing && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex gap-3 text-xs text-amber-500">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>لا توجد إشعارات تلقائية — تواصل مع الموظف وأخبره بمراجعة قسم «مهامي».</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/tasks">إلغاء الأمر</Link></Button>
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} حفظ المهمة
        </Button>
      </div>
    </div>
  );
};

export default TaskForm;
