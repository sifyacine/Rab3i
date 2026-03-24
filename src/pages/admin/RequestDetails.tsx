import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, Edit, Trash, User, Calendar, 
  MessageSquare, CheckCircle2, XCircle, Clock, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";

const RequestDetailsAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock request data
  const request = {
    id: "1", 
    client: "ياسين سيف", 
    service: "تطوير ويب", 
    status: "pending", 
    date: "2024-03-24",
    message: "أبحث عن تطوير متجر إلكتروني متكامل لبيع المنتجات المنزلية مع دعم الدفع بمدى.",
  };

  const handleStatusChange = (newStatus: string) => {
    toast.success(`تم تغيير حالة الطلب إلى ${newStatus}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-4xl mx-auto" dir="rtl">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="rounded-full">
          <Link to="/admin/requests"><ArrowRight className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">تفاصيل الطلب</h1>
          <p className="text-muted-foreground mt-1">الرقم المرجعي: #{id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-border/40 bg-card/30">
          <CardHeader>
            <CardTitle className="text-xl">محتوى الطلب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-1 text-sm">{request.service}</Badge>
              <div className="p-6 rounded-2xl bg-secondary/10 border border-border/40">
                <p className="leading-loose text-lg">{request.message}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button onClick={() => handleStatusChange("approved")} className="bg-emerald-600 hover:bg-emerald-700 gap-2"><CheckCircle2 className="h-4 w-4" /> قبول الطلب</Button>
              <Button onClick={() => handleStatusChange("discussion")} variant="outline" className="gap-2"><MessageSquare className="h-4 w-4" /> فتح نقاش</Button>
              <Button onClick={() => handleStatusChange("rejected")} variant="destructive" className="gap-2"><XCircle className="h-4 w-4" /> رفض</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/30 h-fit">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2"><Info className="h-4 w-4" /> معلومات العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <Label className="text-muted-foreground">العميل</Label>
              <p className="font-bold text-lg">{request.client}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">تاريخ الطلب</Label>
              <p className="font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {request.date}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground">الحالة الحالية</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 shadow-none border-none border-amber-500/20">
                  <Clock className="h-3 w-3 ml-1" /> قيد الانتظار
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default RequestDetailsAdmin;
