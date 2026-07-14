import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Edit, Trash, Loader2, LayoutGrid, Table2, Columns3, Plus, Calendar,
  MoreHorizontal, Search, ClipboardList,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksService, Task, TaskStatus, taskStatusConfig, taskPriorityConfig } from "@/services/tasksService";
import { useAuth } from "@/contexts/AuthContext";
import { isStaffRole } from "@/lib/authSession";

type View = "board" | "grid" | "table";
const VIEW_KEY = "rabii-tasks-view";
const BOARD_STATUSES: TaskStatus[] = ["pending", "in_progress", "done", "canceled"];
const STATUS_DOT: Record<TaskStatus, string> = {
  pending: "bg-blue-500",
  in_progress: "bg-amber-500",
  done: "bg-emerald-500",
  canceled: "bg-muted-foreground",
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn");
const isOverdue = (t: Task) =>
  !!t.due_date && t.status !== "done" && t.status !== "canceled" && new Date(t.due_date) < new Date(new Date().toDateString());

function TaskCard({
  task, board = false, onEdit, onDelete, onDragStart,
}: {
  task: Task;
  board?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
}) {
  const assignee = task.assignee?.full_name || task.assignee?.email || "غير معيّن";
  const overdue = isOverdue(task);

  return (
    <div
      draggable={board}
      onDragStart={onDragStart}
      onClick={() => onEdit(task.id)}
      className={cn(
        "group rounded-xl border border-border/40 bg-card p-4 shadow-sm transition-all hover:border-primary/30 hover:shadow-md",
        board ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-right" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(task.id)}>
              <Edit className="h-4 w-4" /> تعديل
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => onDelete(task.id)}>
              <Trash className="h-4 w-4" /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="outline" className={cn("text-[10px] font-medium", taskPriorityConfig[task.priority]?.className)}>
          {taskPriorityConfig[task.priority]?.label ?? task.priority}
        </Badge>
        {!board && (
          <Badge variant="outline" className={cn("text-[10px] font-medium", taskStatusConfig[task.status]?.className)}>
            {taskStatusConfig[task.status]?.label ?? task.status}
          </Badge>
        )}
        {task.due_date && (
          <span className={cn("inline-flex items-center gap-1 text-[10px] text-muted-foreground", overdue && "font-semibold text-red-500")}>
            <Calendar className="h-3 w-3" /> {fmtDate(task.due_date)}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-1.5 border-t border-border/30 pt-2 text-xs text-muted-foreground">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
          {assignee.charAt(0)}
        </span>
        <span className="truncate">{assignee}</span>
      </div>
    </div>
  );
}

const Tasks = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role } = useAuth();

  const [view, setView] = useState<View>(() => (localStorage.getItem(VIEW_KEY) as View) || "board");
  const [search, setSearch] = useState("");
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const changeView = (v: View) => {
    if (!v) return;
    setView(v);
    localStorage.setItem(VIEW_KEY, v);
  };

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["admin-tasks"],
    queryFn: () => tasksService.getTasks(),
    enabled: isStaffRole(role),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tasksService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
      toast.success("تم حذف المهمة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  // Drag-and-drop status change with an optimistic update so the card moves
  // instantly and reverts if the save fails.
  const moveMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksService.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-tasks"] });
      const prev = queryClient.getQueryData<Task[]>(["admin-tasks"]);
      queryClient.setQueryData<Task[]>(["admin-tasks"], (old) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, status } : t))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin-tasks"], ctx.prev);
      toast.error("تعذّر نقل المهمة");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["admin-tasks"] }),
  });

  const goEdit = (id: string) => navigate(`/admin/tasks/${id}/edit`);
  const handleMove = (id: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === id);
    if (task && task.status !== status) moveMutation.mutate({ id, status });
  };

  const q = search.trim().toLowerCase();
  const filtered = q
    ? tasks.filter((t) =>
        [t.title, t.description, t.assignee?.full_name, t.assignee?.email]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      )
    : tasks;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" dir="rtl">
      {/* Header: title + search + view switcher + add */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-2xl font-bold">إدارة المهام</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مهمة..."
              className="pr-9"
            />
          </div>
          <ToggleGroup type="single" value={view} onValueChange={(v) => changeView(v as View)} className="rounded-lg border border-border/50 bg-secondary/30 p-0.5">
            <ToggleGroupItem value="board" aria-label="لوحة" className="h-8 w-9 data-[state=on]:bg-background data-[state=on]:text-primary">
              <Columns3 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="grid" aria-label="بطاقات" className="h-8 w-9 data-[state=on]:bg-background data-[state=on]:text-primary">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="جدول" className="h-8 w-9 data-[state=on]:bg-background data-[state=on]:text-primary">
              <Table2 className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={() => navigate("/admin/tasks/new")} className="gap-2 bg-gradient-brand shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> مهمة جديدة
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-card/30 py-20 text-center">
          <ClipboardList className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-muted-foreground">لا توجد مهام بعد — أنشئ أول مهمة وأسندها لموظف.</p>
        </div>
      ) : (
        <>
          {/* ── Board (Kanban) ── */}
          {view === "board" && filtered.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">لا نتائج مطابقة للبحث.</p>
          )}
          {view === "board" && filtered.length > 0 && (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {BOARD_STATUSES.map((status) => {
                const colTasks = filtered.filter((t) => t.status === status);
                return (
                  <div
                    key={status}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(status); }}
                    onDragLeave={() => setDragOver((s) => (s === status ? null : s))}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(null);
                      const id = e.dataTransfer.getData("taskId");
                      if (id) handleMove(id, status);
                    }}
                    className={cn(
                      "flex w-72 shrink-0 flex-col rounded-2xl border p-3 transition-colors",
                      dragOver === status ? "border-primary/50 bg-primary/5" : "border-border/40 bg-secondary/20"
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between px-1">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <span className={cn("h-2.5 w-2.5 rounded-full", STATUS_DOT[status])} />
                        {taskStatusConfig[status].label}
                      </span>
                      <Badge variant="secondary" className="font-sans">{colTasks.length}</Badge>
                    </div>
                    <div className="flex min-h-[100px] flex-col gap-3">
                      {colTasks.map((t) => (
                        <TaskCard
                          key={t.id}
                          task={t}
                          board
                          onEdit={goEdit}
                          onDelete={setTaskToDelete}
                          onDragStart={(e) => e.dataTransfer.setData("taskId", t.id)}
                        />
                      ))}
                      {colTasks.length === 0 && (
                        <p className="py-8 text-center text-xs text-muted-foreground/50">اسحب مهمة إلى هنا</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Grid ── */}
          {view === "grid" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <TaskCard key={t.id} task={t} onEdit={goEdit} onDelete={setTaskToDelete} />
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full py-10 text-center text-sm text-muted-foreground">لا نتائج مطابقة للبحث.</p>
              )}
            </div>
          )}

          {/* ── Table ── */}
          {view === "table" && (
            <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/30">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">المهمة</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الأولوية</TableHead>
                    <TableHead className="text-right">الاستحقاق</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((t) => (
                    <TableRow key={t.id} className="cursor-pointer hover:bg-muted/40" onClick={() => goEdit(t.id)}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-sm">{t.assignee?.full_name || t.assignee?.email || "غير معيّن"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", taskStatusConfig[t.status]?.className)}>
                          {taskStatusConfig[t.status]?.label ?? t.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("font-medium", taskPriorityConfig[t.priority]?.className)}>
                          {taskPriorityConfig[t.priority]?.label ?? t.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className={cn("text-sm text-muted-foreground", isOverdue(t) && "font-semibold text-red-500")}>
                        {t.due_date ? fmtDate(t.due_date) : "—"}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-right">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => goEdit(t.id)}>
                              <Edit className="h-4 w-4" /> تعديل
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={() => setTaskToDelete(t.id)}>
                              <Trash className="h-4 w-4" /> حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">لا نتائج مطابقة للبحث.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && setTaskToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف المهمة؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه المهمة؟ لا يمكن استعادة البيانات المحذوفة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (taskToDelete) { deleteMutation.mutate(taskToDelete); setTaskToDelete(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Tasks;
