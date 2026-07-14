import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight, Edit, Trash, Mail, Phone,
  Briefcase, Calendar, Folder, Wallet, Loader2, StickyNote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "@/services/clientsService";

const ClientDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const { data: client, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsService.getClientById(id!),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => clientsService.deleteClient(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("تم حذف العميل بنجاح");
      navigate("/admin/clients");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">لم يتم العثور على العميل</p>
        <Button variant="outline" asChild><Link to="/admin/clients">العودة للعملاء</Link></Button>
      </div>
    );
  }

  const joinDate = new Date(client.created_at).toLocaleDateString("ar-SA-u-ca-gregory-nu-latn");
  const isActive = client.status === "active";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/clients"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "نشط" : "غير نشط"}</Badge>
            </div>
            {client.company && (
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <Briefcase className="h-4 w-4" /> {client.company}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" asChild className="gap-2">
            <Link to={`/admin/clients/${id}/edit`}><Edit className="h-4 w-4" /> تعديل</Link>
          </Button>
          <Button variant="destructive" onClick={() => setIsAlertOpen(true)} className="gap-2 border-none">
            <Trash className="h-4 w-4" /> حذف العميل
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-xl">معلومات التواصل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground">البريد الإلكتروني</Label>
                {client.email ? (
                  <a href={`mailto:${client.email}`} className="font-medium flex items-center gap-2 hover:text-primary transition-colors" dir="ltr">
                    <Mail className="h-4 w-4 text-primary" /> {client.email}
                  </a>
                ) : (
                  <p className="font-medium text-muted-foreground">—</p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">رقم الجوال</Label>
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="font-medium flex items-center gap-2 font-sans hover:text-primary transition-colors" dir="ltr">
                    <Phone className="h-4 w-4 text-primary" /> {client.phone}
                  </a>
                ) : (
                  <p className="font-medium text-muted-foreground">—</p>
                )}
              </div>
            </div>
            {client.notes && (
              <div className="space-y-1 pt-2 border-t border-border/30">
                <Label className="text-muted-foreground flex items-center gap-2"><StickyNote className="h-4 w-4" /> ملاحظات</Label>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Folder className="h-4 w-4" /> المشاريع</span>
              <span className="font-bold">{client.projects_count ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /> إجمالي الإنفاق</span>
              <span className="font-bold font-sans">{client.total_spent ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> تاريخ الانضمام</span>
              <span className="font-bold">{joinDate}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العميل نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف بيانات هذا العميل من قاعدة البيانات. هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ClientDetailsAdmin;
