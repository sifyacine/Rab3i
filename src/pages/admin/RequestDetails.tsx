import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, XCircle, Clock, Info, Mail, Phone,
  User, Calendar, Tag, DollarSign, MessageSquare, Loader2, Zap, FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { requestsService, GuestRequest, RequestStatus } from "@/services/requestsService";
import { cn } from "@/lib/utils";
import { useState } from "react";

const statusConfig: Record<RequestStatus, { label: string; className: string }> = {
  new:       { label: "جديد", className: "bg-blue-500/15 text-blue-600 border-blue-500/30" },
  analysis:  { label: "قيد المراجعة", className: "bg-amber-500/15 text-amber-600 border-amber-500/30" },
  replied:   { label: "تم الرد", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" },
  converted: { label: "تحوّل لمشروع", className: "bg-primary/15 text-primary border-primary/30" },
  closed:    { label: "مغلق", className: "bg-muted text-muted-foreground border-border" },
};

const RequestDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [adminNotes, setAdminNotes] = useState("");
  const [notesChanged, setNotesChanged] = useState(false);

  const { data: request, isLoading } = useQuery({
    queryKey: ["admin-request", id],
    queryFn: () => requestsService.getRequestById(id!),
    enabled: !!id,
  });

  // Pre-fill admin notes when data loads
  const [notesSynced, setNotesSynced] = useState(false);
  if (request && !notesSynced) {
    setAdminNotes(request.admin_notes ?? "");
    setNotesSynced(true);
  }

  const updateMutation = useMutation({
    mutationFn: (updates: Partial<Pick<GuestRequest, "status" | "admin_notes">>) =>
      requestsService.updateRequest(id!, updates),
    onSuccess: () => {
      toast.success("تم التحديث");
      queryClient.invalidateQueries({ queryKey: ["admin-request", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-requests"] });
      setNotesChanged(false);
    },
    onError: () => toast.error("حدث خطأ أثناء التحديث"),
  });

  const changeStatus = (status: RequestStatus) => {
    updateMutation.mutate({ status });
  };

  const saveNotes = () => {
    updateMutation.mutate({ admin_notes: adminNotes });
  };

  const convertToProject = () => {
    updateMutation.mutate({ status: "analysis" });
    navigate("/admin/projects/new", { state: { request } });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">لم يُعثر على الطلب</p>
        <Button variant="outline" asChild className="mt-4">
          <Link to="/admin/requests">العودة</Link>
        </Button>
      </div>
    );
  }

  const cfg = statusConfig[request.status];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full shrink-0">
          <Link to="/admin/requests"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">تفاصيل الطلب</h1>
            <Badge variant="outline" className={cn("text-xs font-medium", cfg.className)}>{cfg.label}</Badge>
          </div>
          <p className="text-muted-foreground text-sm mt-0.5">#{id?.slice(0, 8)}… — {new Date(request.created_at).toLocaleDateString("ar-SA", { dateStyle: "long" })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Project details card */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> محتوى الطلب
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Tag className="h-3 w-3" />{request.project_type}
                </Badge>
                {request.budget && (
                  <Badge variant="outline" className="gap-1.5">
                    <DollarSign className="h-3 w-3" />{request.budget}
                  </Badge>
                )}
              </div>

              <div className="rounded-xl bg-secondary/30 border border-border/40 p-5">
                <p className="leading-loose text-sm whitespace-pre-wrap">{request.details}</p>
              </div>

              {/* Requested services */}
              {request.service_ids && request.service_ids.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">الخدمات المطلوبة</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {request.service_ids.map(slug => (
                      <span key={slug} className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                        <Zap className="h-3 w-3" />{slug}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin notes */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" /> ملاحظات الفريق الداخلية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={adminNotes}
                onChange={e => { setAdminNotes(e.target.value); setNotesChanged(true); }}
                rows={4}
                placeholder="أضف أي ملاحظات داخلية حول هذا الطلب..."
                dir="rtl"
              />
              {notesChanged && (
                <Button size="sm" onClick={saveNotes} disabled={updateMutation.isPending} className="gap-2">
                  {updateMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                  حفظ الملاحظات
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="border-border/40 bg-secondary/10">
            <CardHeader>
              <CardTitle className="text-base">الإجراءات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={convertToProject}
                  disabled={updateMutation.isPending || request.status === "converted"}
                  className="gap-2 bg-primary hover:bg-primary/90"
                >
                  <FolderOpen className="h-4 w-4" />
                  تحويل لمشروع
                </Button>
                <Button
                  onClick={() => changeStatus("replied")}
                  variant="outline"
                  disabled={updateMutation.isPending || request.status === "replied"}
                  className="gap-2 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/10"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  تحديد كـ "تم الرد"
                </Button>
                <Button
                  onClick={() => changeStatus("analysis")}
                  variant="outline"
                  disabled={updateMutation.isPending || request.status === "analysis"}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4" />
                  قيد المراجعة
                </Button>
                <Button
                  onClick={() => changeStatus("closed")}
                  variant="outline"
                  disabled={updateMutation.isPending || request.status === "closed"}
                  className="gap-2 text-muted-foreground"
                >
                  <XCircle className="h-4 w-4" />
                  إغلاق الطلب
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Client info */}
        <div className="space-y-5">
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-primary" /> معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">الاسم</Label>
                <p className="font-semibold">{request.guest_name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> البريد الإلكتروني
                </Label>
                <a href={`mailto:${request.guest_email}`} className="text-sm text-primary hover:underline" dir="ltr">
                  {request.guest_email}
                </a>
              </div>
              {request.guest_phone && (
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" /> الهاتف
                  </Label>
                  <a href={`tel:${request.guest_phone}`} className="text-sm text-primary hover:underline" dir="ltr">
                    {request.guest_phone}
                  </a>
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> تاريخ الطلب
                </Label>
                <p className="text-sm">{new Date(request.created_at).toLocaleDateString("ar-SA", { dateStyle: "long" })}</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <Label className="text-xs text-muted-foreground">حساب مرتبط</Label>
                <div className="mt-1">
                  {request.user_id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> مستخدم مسجّل
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">ضيف (لا حساب بعد)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Linked project */}
          {request.project_id && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="pt-5 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">تم تحويله لمشروع</p>
                <Button variant="outline" size="sm" asChild className="w-full gap-2">
                  <Link to={`/admin/projects/${request.project_id}`}>
                    <FolderOpen className="h-3.5 w-3.5" /> عرض المشروع
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RequestDetailsAdmin;
