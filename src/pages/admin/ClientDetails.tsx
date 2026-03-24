import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, Mail, Phone, 
  MapPin, Briefcase, Calendar, Folder, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

const ClientDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Mock client data
  const client = {
    id: "1", 
    name: "ياسين سيف", 
    email: "yassine@example.com", 
    phone: "+966 50 123 4567", 
    company: "شركة سيف التقنية", 
    address: "الرياض، المملكة العربية السعودية",
    joinDate: "2024-01-15",
    projectsCount: 3,
    requestsCount: 1,
    status: "active"
  };

  const confirmDelete = () => {
    toast.success("تم حذف العميل بنجاح");
    navigate("/admin/clients");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto" dir="rtl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild className="rounded-full">
            <Link to="/admin/clients"><ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{client.name}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> {client.company}
            </p>
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
                <p className="font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {client.email}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">رقم الجوال</Label>
                <p className="font-medium flex items-center gap-2 font-sans"><Phone className="h-4 w-4 text-primary" /> {client.phone}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-muted-foreground">العنوان</Label>
                <p className="font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {client.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-lg">إحصائيات سريعة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Folder className="h-4 w-4" /> المشاريع</span>
              <span className="font-bold">{client.projectsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><MessageSquare className="h-4 w-4" /> الطلبات</span>
              <span className="font-bold">{client.requestsCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" /> تاريخ الانضمام</span>
              <span className="font-bold">{client.joinDate}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العميل نهائياً؟</AlertDialogTitle>
            <AlertDialogDescription>سيتم حذف بيانات العميل وكافة المشاريع والطلبات المتعلقة به. هذا الإجراء لا يمكن التراجع عنه.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">تأكيد الحذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default ClientDetailsAdmin;
