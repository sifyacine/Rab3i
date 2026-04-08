import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Check, User, DollarSign, Calendar, Save, 
  ArrowRight, Plus, Trash2, FileText, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const InvoiceFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<any>({
    invoiceNumber: "INV-2024-001",
    client: "",
    amount: "",
    status: "pending",
    dueDate: new Date().toISOString().split('T')[0],
    items: [{ title: "", price: "" }]
  });

  useEffect(() => {
    if (isEditing) {
      // Mock data
      setFormData({
        id: "1", 
        invoiceNumber: "INV-2024-001", 
        client: "ياسين سيف", 
        amount: "5000 ⃁", 
        status: "paid", 
        dueDate: "2024-04-01",
        items: [
          { title: "تطوير موقع الكتروني", price: "4000 ⃁" },
          { title: "تصميم الهوية البصرية", price: "1000 ⃁" }
        ]
      });
    }
  }, [id, isEditing]);

  const addItem = () => {
    setFormData({...formData, items: [...formData.items, { title: "", price: "" }]});
  };

  const removeItem = (index: number) => {
    setFormData({...formData, items: formData.items.filter((_: any, i: number) => i !== index)});
  };

  const handleSave = () => {
    toast.success(isEditing ? "تم تحديث الفاتورة" : "تم إنشاء الفاتورة بنجاح");
    navigate("/admin/invoices");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل فاتورة" : "فاتورة جديدة"}</h1>
        <Button variant="ghost" asChild><Link to="/admin/invoices">الغاء</Link></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>بنود الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 items-end animate-in fade-in slide-in-from-right-2">
                  <div className="flex-1 space-y-2">
                    <Label>الوصف</Label>
                    <Input placeholder="اسم الخدمة أو البند" value={item.title} onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].title = e.target.value;
                      setFormData({...formData, items: newItems});
                    }} />
                  </div>
                  <div className="w-32 space-y-2">
                    <Label>السعر</Label>
                    <Input placeholder="500 ⃁" value={item.price} onChange={(e) => {
                      const newItems = [...formData.items];
                      newItems[index].price = e.target.value;
                      setFormData({...formData, items: newItems});
                    }} />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} className="text-destructive mb-0.5">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addItem}>
                <Plus className="h-4 w-4" /> إضافة بند جديد
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg">معلومات الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>رقم الفاتورة</Label>
                <div className="relative">
                  <Hash className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input className="pr-10 font-sans" value={formData.invoiceNumber} readOnly />
                </div>
              </div>
              <div className="space-y-2">
                <Label>العميل</Label>
                <Select value={formData.client} onValueChange={(v) => setFormData({...formData, client: v})}>
                  <SelectTrigger className="pr-10 relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ياسين سيف">ياسين سيف</SelectItem>
                    <SelectItem value="عبدالله محمد">عبدالله محمد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>حالة الدفع</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">مدفوعة</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="overdue">متأخرة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>تاريخ الاستحقاق</Label>
                <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/invoices">إلغاء الأمر</Link></Button>
        <Button onClick={handleSave} className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20">
          <Save size={18} /> إصدار الفاتورة
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFormAdmin;
