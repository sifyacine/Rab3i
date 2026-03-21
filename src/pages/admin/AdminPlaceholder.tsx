import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Construction } from "lucide-react";

const titles: Record<string, string> = {
  "/admin/projects": "إدارة المشاريع",
  "/admin/blog": "إدارة المدونة",
  "/admin/services": "إدارة الخدمات",
  "/admin/clients": "إدارة العملاء",
  "/admin/requests": "إدارة الطلبات",
  "/admin/users": "إدارة المستخدمون",
  "/admin/settings": "الإعدادات",
};

const AdminPlaceholder = () => {
  const location = useLocation();
  const title = titles[location.pathname] || "قريباً";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Construction size={36} />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">
        هذا القسم قيد التطوير. سيتم ربطه بقاعدة البيانات في المرحلة القادمة
      </p>
    </motion.div>
  );
};

export default AdminPlaceholder;
