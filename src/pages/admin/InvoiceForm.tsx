import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Save, Plus, Trash2, Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { invoicesService, computeInvoiceTotals, VAT_RATE, InvoiceItem } from "@/services/invoicesService";

interface ItemRow {
  description: string;
  quantity: string;
  unit_price: string;
}

const EMPTY_ROW: ItemRow = { description: "", quantity: "1", unit_price: "" };

const InvoiceFormAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [invoiceNumber, setInvoiceNumber] = useState("INV-" + Date.now());
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [status, setStatus] = useState<"paid" | "unpaid" | "overdue" | "canceled">("unpaid");
  const [items, setItems] = useState<ItemRow[]>([{ ...EMPTY_ROW }]);

  const { data: existingInvoice } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoicesService.getInvoiceById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (existingInvoice) {
      setInvoiceNumber(existingInvoice.id);
      setCustomerName(existingInvoice.customer_name ?? "");
      setCustomerPhone(existingInvoice.customer_phone ?? "");
      setPaymentMethod(existingInvoice.payment_method ?? "");
      setStatus(existingInvoice.status);
      const rows: ItemRow[] = existingInvoice.items && existingInvoice.items.length
        ? existingInvoice.items.map((it) => ({
            description: it.description ?? "",
            quantity: String(it.quantity ?? 1),
            unit_price: String(it.unit_price ?? ""),
          }))
        // Legacy invoice with no stored items: reconstruct one net line from the
        // VAT-inclusive total so re-saving preserves the amount.
        : [{ description: "خدمات تصميم وتطوير", quantity: "1", unit_price: String(Math.round((existingInvoice.total / (1 + VAT_RATE)) * 100) / 100) }];
      setItems(rows);
    }
  }, [existingInvoice]);

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof invoicesService.createInvoice>[0]) => invoicesService.createInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success("تم إنشاء الفاتورة بنجاح");
      navigate("/admin/invoices");
    },
    onError: (error: Error) => toast.error(error.message || "حدث خطأ أثناء إنشاء الفاتورة"),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Parameters<typeof invoicesService.updateInvoice>[1]) => invoicesService.updateInvoice(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice", id] });
      toast.success("تم تحديث الفاتورة بنجاح");
      navigate("/admin/invoices");
    },
    onError: (error: Error) => toast.error(error.message || "حدث خطأ أثناء تحديث الفاتورة"),
  });

  const addItem = () => setItems([...items, { ...EMPTY_ROW }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
  const updateItem = (index: number, patch: Partial<ItemRow>) =>
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));

  // Normalise once so the live breakdown and the saved payload are identical:
  // quantity clamps to a whole number ≥ 1, price clamps to ≥ 0, and only rows
  // with a positive price are billed.
  const cleanItems: InvoiceItem[] = items
    .map((it) => ({
      description: it.description.trim(),
      quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
      unit_price: Math.max(0, Number(it.unit_price) || 0),
    }))
    .filter((it) => it.unit_price > 0);

  const { subtotal, vat, total } = computeInvoiceTotals(cleanItems);

  const saving = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!customerName.trim()) {
      toast.error("يرجى إدخال اسم العميل");
      return;
    }
    if (cleanItems.length === 0 || total <= 0) {
      toast.error("يرجى إدخال بند واحد على الأقل بسعر صحيح");
      return;
    }

    const payload = {
      customer_name: customerName.trim(),
      status,
      customer_phone: customerPhone.trim() || null,
      payment_method: paymentMethod || null,
      items: cleanItems,
    };

    if (isEditing) updateMutation.mutate(payload);
    else createMutation.mutate(payload);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{isEditing ? "تعديل فاتورة" : "فاتورة جديدة"}</h1>
        <Button variant="ghost" asChild><Link to="/admin/invoices">إلغاء</Link></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/40 bg-card/30">
            <CardHeader>
              <CardTitle>بنود الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-1 space-y-2">
                    <Label>الوصف</Label>
                    <Input
                      placeholder="اسم الخدمة أو البند"
                      value={item.description}
                      onChange={(e) => updateItem(index, { description: e.target.value })}
                    />
                  </div>
                  <div className="w-20 space-y-2">
                    <Label>الكمية</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: e.target.value })}
                    />
                  </div>
                  <div className="w-28 space-y-2">
                    <Label>السعر (صافي)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="500"
                      value={item.unit_price}
                      onChange={(e) => updateItem(index, { unit_price: e.target.value })}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-destructive mb-0.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" className="w-full gap-2 border-dashed" onClick={addItem}>
                <Plus className="h-4 w-4" /> إضافة بند جديد
              </Button>

              <div className="space-y-2 pt-4 border-t border-border/40">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>المجموع الفرعي (صافي)</span>
                  <span className="font-sans">{subtotal.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span className="font-sans">{vat.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-1">
                  <span>الإجمالي (شامل الضريبة)</span>
                  <span className="font-sans">{total.toLocaleString()} ر.س</span>
                </div>
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
                  <Input className="pr-10 font-sans" value={invoiceNumber} readOnly />
                </div>
                {!isEditing && (
                  <p className="text-[10px] text-muted-foreground">يُنشأ رقم نهائي تلقائياً عند الحفظ</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>العميل</Label>
                <Input placeholder="اسم العميل" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>رقم الهاتف</Label>
                <Input placeholder="05xxxxxxxx" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>طريقة الدفع</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
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
                <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
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
          disabled={saving}
        >
          <Save size={18} /> {isEditing ? "تحديث الفاتورة" : "إصدار الفاتورة"}
        </Button>
      </div>
    </div>
  );
};

export default InvoiceFormAdmin;
