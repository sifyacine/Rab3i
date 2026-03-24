import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Phone, Mail, Edit, Eye, Trash } from "lucide-react";
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

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  projectsCount: number;
}

const mockClients: Client[] = [
  { id: "1", name: "عبدالله محمد", email: "abdullah@example.com", company: "النبراس العقارية", projectsCount: 2 },
  { id: "2", name: "سارة الأحمد", email: "sara@test.com", company: "ستوديو فنون", projectsCount: 1 },
  { id: "3", name: "خالد سعيد", email: "khaled@corp.com", company: "شركة التوريدات", projectsCount: 3 },
];

const Clients = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (clientToDelete) {
      setClients(clients.filter(c => c.id !== clientToDelete));
      toast.success("تم حذف العميل بنجاح");
      setClientToDelete(null);
    }
  };

  const columns = [
    {
      header: "العميل",
      accessorKey: "name" as const,
      cell: (item: Client) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{item.name[0]}</AvatarFallback>
          </Avatar>
          <span>{item.name}</span>
        </div>
      ),
    },
    { header: "الشركة", accessorKey: "company" as const },
    { header: "البريد الإلكتروني", accessorKey: "email" as const },
    { header: "المشاريع", accessorKey: "projectsCount" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة العملاء</h1>
      <SmartDataTable
        data={clients}
        columns={columns}
        cardTitle={(c) => c.name}
        cardSubtitle={(c) => c.company}
        onAdd={() => navigate("/admin/clients/new")}
        onRowClick={(c) => navigate(`/admin/clients/${c.id}`)}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/clients/${item.id}`);
            }}>
              <Eye className="h-4 w-4" />
              عرض الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/clients/${item.id}/edit`);
            }}>
              <Edit className="h-4 w-4" />
              تعديل بيانات
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Mail className="h-4 w-4" />
              مراسلة
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <Phone className="h-4 w-4" />
              اتصال
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="gap-2 cursor-pointer text-destructive focus:text-destructive" 
              onClick={(e) => {
                e.stopPropagation();
                setClientToDelete(item.id);
              }}
            >
              <Trash className="h-4 w-4" />
              حذف العميل
            </DropdownMenuItem>
          </>
        )}
      />

      <AlertDialog open={!!clientToDelete} onOpenChange={(open) => !open && setClientToDelete(null)}>
        <AlertDialogContent className="text-right" dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>حذف العميل؟</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا العميل؟ سيتم حذف كافة البيانات المتعلقة به نهائياً.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default Clients;
