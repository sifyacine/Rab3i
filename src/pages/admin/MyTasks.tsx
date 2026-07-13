import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar, Briefcase, Loader2, ClipboardList, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService, Task, TaskStatus, taskStatusConfig, taskPriorityConfig } from "@/services/tasksService";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffRole } from "@/lib/authSession";

// Local YYYY-MM-DD (avoids the UTC-midnight parse that makes a `date` column
// value look overdue for the whole of its own due day)
const todayISO = () => {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
};

const TaskCard = ({ task }: { task: Task }) => {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState(task.worker_notes ?? "");

  const progressMutation = useMutation({
    mutationFn: (updates: { status?: TaskStatus; worker_notes?: string }) =>
      tasksService.updateMyTaskProgress(task.id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      toast.success("تم تحديث المهمة");
    },
    onError: () => toast.error("تعذر تحديث المهمة"),
  });

  const isCanceled = task.status === "canceled";
  const overdue =
    task.due_date &&
    task.status !== "done" &&
    !isCanceled &&
    task.due_date < todayISO();

  return (
    <Card className="border-border/40 bg-card/30">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">{task.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={cn("font-medium", taskPriorityConfig[task.priority]?.className)}>
              {taskPriorityConfig[task.priority]?.label ?? task.priority}
            </Badge>
            <Badge variant="outline" className={cn("font-medium", taskStatusConfig[task.status]?.className)}>
              {taskStatusConfig[task.status]?.label ?? task.status}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mt-1">
          {task.due_date && (
            <span className={cn("flex items-center gap-1", overdue && "text-red-500 font-semibold")}>
              <Calendar className="h-3.5 w-3.5" />
              {new Date(task.due_date).toLocaleDateString("ar-SA")}
              {overdue && " (متأخرة)"}
            </span>
          )}
          {task.project?.title_ar && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {task.project.title_ar}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{task.description}</p>
        )}

        {isCanceled ? (
          <p className="text-sm text-muted-foreground">
            ألغى المدير هذه المهمة — لم يعد بإمكانك تعديلها.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={task.status}
                  onValueChange={(v) => progressMutation.mutate({ status: v as TaskStatus })}
                  disabled={progressMutation.isPending}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{taskStatusConfig.pending.label}</SelectItem>
                    <SelectItem value="in_progress">{taskStatusConfig.in_progress.label}</SelectItem>
                    <SelectItem value="done">{taskStatusConfig.done.label}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${task.id}`}>ملاحظاتك للمدير</Label>
              <Textarea
                id={`notes-${task.id}`}
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب تحديثاً عن سير العمل..."
              />
              {notes !== (task.worker_notes ?? "") && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  disabled={progressMutation.isPending}
                  onClick={() => progressMutation.mutate({ worker_notes: notes })}
                >
                  {progressMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  حفظ الملاحظات
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const MyTasks = () => {
  const { role } = useAuth();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: () => tasksService.getMyTasks(),
    enabled: isStaffRole(role),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  const active = tasks.filter((t) => t.status === "pending" || t.status === "in_progress");
  const finished = tasks.filter((t) => t.status === "done" || t.status === "canceled");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-3xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold">مهامي</h1>

      {tasks.length === 0 && (
        <Card className="border-border/40 bg-card/30">
          <CardContent className="py-16 text-center space-y-3">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground/50" />
            <p className="text-muted-foreground">لا توجد مهام مسندة إليك حالياً</p>
          </CardContent>
        </Card>
      )}

      {/* One parent for all cards: when a task changes status and moves between
          the two groups, React reconciles by key within this container instead
          of remounting the card — so unsaved notes in the textarea survive. */}
      <div className="space-y-4">
        {active.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground">المهام الحالية ({active.length})</h2>
        )}
        {active.map((t) => <TaskCard key={t.id} task={t} />)}

        {finished.length > 0 && (
          <h2 className="text-sm font-semibold text-muted-foreground pt-4">المهام المنتهية ({finished.length})</h2>
        )}
        {finished.map((t) => <TaskCard key={t.id} task={t} />)}
      </div>
    </motion.div>
  );
};

export default MyTasks;
