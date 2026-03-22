import { motion } from "framer-motion";
import { SmartDataTable } from "@/components/admin/SmartDataTable";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Phone, Mail, Edit } from "lucide-react";

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
        data={mockClients}
        columns={columns}
        cardTitle={(c) => c.name}
        cardSubtitle={(c) => c.company}
        actions={(item) => (
          <>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Mail className="h-4 w-4" />
              مراسلة
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Phone className="h-4 w-4" />
              اتصال
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Edit className="h-4 w-4" />
              تعديل بيانات
            </DropdownMenuItem>
          </>
        )}
      />
    </motion.div>
  );
};

export default Clients;
