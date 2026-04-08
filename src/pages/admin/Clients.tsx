import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { clientsService, Client } from "@/services/clientsService";

const Clients = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => clientsService.getClients()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success("تم حذف العميل بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف")
  });

  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  const confirmDelete = () => {
    if (clientToDelete) {
      deleteMutation.mutate(clientToDelete);
      setClientToDelete(null);
    }
  };

  const columns = [
    {
      header: "العميل",
      accessorKey: "name" as const,
      cell: (item: Client) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{item.name[0]}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { header: "الشركة", accessorKey: "company" as const },
    { header: "البريد الإلكتروني", accessorKey: "email" as const },
    { header: "المشاريع", accessorKey: "projects_count" as const },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة العملاء</h1>
      <SmartDataTable
        data={clients}
        columns={columns}
        isLoading={isLoading}
        cardTitle={(c) => c.name}
        cardSubtitle={(c) => c.company ?? ""}
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
