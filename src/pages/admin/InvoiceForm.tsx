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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesService } from "@/services/invoicesService";

const InvoiceFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  
  const [formData, setFormData] = useState<any>({
    invoiceNumber: "INV-" + Date.now(),
    customer_name: "",
    total: 0,
    status: "unpaid",
    dueDate: new Date().toISOString().split('T')[0],
    customer_phone: "",
    payment_method: "",
    items: [{ title: "", price: "" }]
  });

  // Fetch existing invoice when editing
  const { data: existingInvoice } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesService.getInvoiceById(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (existingInvoice) {
      setFormData({
        ...existingInvoice,
        items: [{ title: "خدمات التصميم والتطوير", price: existingInvoice.total.toString() }]
      });
    }
  }, [existingInvoice]);

  const createMutation = useMutation({
    mutationFn: invoicesService.createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("تم إنشاء الفاتورة بنجاح");
      navigate("/admin/invoices");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء إنشاء الفاتورة");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => invoicesService.updateInvoice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("تم تحديث الفاتورة بنجاح");
      navigate("/admin/invoices");
    },
    onError: (error: any) => {
      toast.error(error.message || "حدث خطأ أثناء تحديث الفاتورة");
    }
  });

  const addItem = () => {
    setFormData({...formData, items: [...formData.items, { title: "", price: "" }]});
  };

  const removeItem = (index: number) => {
    setFormData({...formData, items: formData.items.filter((_: any, i: number) => i !== index)});
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum: number, item: any) => {
      const price = parseFloat(item.price) || 0;
      return sum + price;
    }, 0);
  };

  const handleSave = () => {
    const total = calculateTotal();
    if (!formData.customer_name) {
      toast.error("يرجى اختيار العميل");
      return;
    }
    if (total <= 0) {
      toast.error("يرجى إدخال بنود الفاتورة");
      return;
    }

    const invoiceData = {
      customer_name: formData.customer_name,
      total: total,
      status: formData.status,
      customer_phone: formData.customer_phone || null,
      payment_method: formData.payment_method || null
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, data: invoiceData });
    } else {
      createMutation.mutate(invoiceData);
    }
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
                    <Input placeholder="500 ⃁" type="number" value={item.price} onChange={(e) => {
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
              <div className="flex justify-end pt-4 border-t">
                <span className="text-lg font-bold">المجموع: ⃁ {calculateTotal().toLocaleString()}</span>
              </div>
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
                <Input 
                  placeholder="اسم العميل" 
                  value={formData.customer_name} 
                  onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input 
                  placeholder="05xxxxxxxx" 
                  value={formData.customer_phone} 
                  onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={formData.payment_method} onValueChange={(v) => setFormData({...formData, payment_method: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطريقة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                    <SelectItem value="cash">نقدي</SelectItem>
                    <SelectItem value="card">بطاقة ائتمان</SelectItem>
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
                    <SelectItem value="unpaid">غير مدفوعة</SelectItem>
                    <SelectItem value="overdue">متأخرة</SelectItem>
                    <SelectItem value="canceled">ملغاة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end gap-3 pb-10">
        <Button variant="outline" asChild><Link to="/admin/invoices">إلغاء الأمر</Link></Button>
        <Button 
          onClick={handleSave} 
          className="bg-gradient-brand gap-2 px-8 shadow-lg shadow-primary/20"
          disabled={createMutation.isPending || updateMutation.isPending}
        >
          <Save size={18} /> {isEditing ? "تحديث الفاتورة" : "إصدار الفاتورة"}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFormAdmin;
