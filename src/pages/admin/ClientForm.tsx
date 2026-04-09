import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, User, Mail, Phone, MapPin, 
  Briefcase, Save, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsService } from "@/services/clientsService";

const ClientFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    notes: ""
  });

  // Fetch existing client when editing
  const { data: existingClient } = useQuery({
    queryKey: ["client", id],
    queryFn: () => clientsService.getClientById(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (existingClient) {
      setFormData({
        ...existingClient,
        address: ""
      });
    }
  }, [existingClient]);

  const createMutation = useMutation({
    mutationFn: clientsService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("تم إضافة العميل بنجاح");
      navigate("/admin/clients");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إضافة العميل");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => clientsService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("تم تحديث بيانات العميل");
      navigate("/admin/clients");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث العميل");
    }
  });

  const handleSave = () => {
    if (!formData.name) {
      toast.error("يرجى إدخال اسم العميل");
      return;
    }

    const clientData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      company: formData.company || null,
      notes: formData.notes || null
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, data: clientData });
    } else {
      createMutation.mutate(clientData);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "تعديل بيانات العميل" : "عميل جديد"}</h1>
          <p className="text-muted-foreground mt-1">إدخال بيانات التواصل والشركة للعميل.</p>
        </div>
        <Button variant="ghost" asChild><Link to="/admin/clients">الغاء</Link></Button>
      </div>

      <Card className="border-border/40 bg-card/30">
        <CardHeader>
          <CardTitle>المعلومات الشخصية</CardTitle>
          <CardDescription>بيانات التواصل الأساسية للعميل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">الإسم الكامل *</Label>
              <div className="relative">
                <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="name" className="pr-10" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="ياسين سيف" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pr-10" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} placeholder="example@mail.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الجوال</Label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="phone" className="pr-10" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+966 --- --- ----" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">اسم الشركة (اختياري)</Label>
              <div className="relative">
                <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="company" className="pr-10" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} placeholder="اسم المنشأة" />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Input id="notes" value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} placeholder="ملاحظات حول العميل..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/clients">إلغاء الأمر</Link></Button>
        <Button 
          onClick={handleSave} 
          className="bg-gradient-brand gap-2 px-8"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save size={18} /> {isEditing ? "تحديث البيانات" : "حفظ البيانات"}
        </Button>
      </div>
    </div>
  );
};

export default ClientFormAdmin;
