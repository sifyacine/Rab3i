import { motion } from "framer-motion";
import { Briefcase, FileText, MessageSquare, Users, TrendingUp, Eye } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const stats = [
  { label: "المشاريع", value: "24", icon: Briefcase, change: "+3 هذا الشهر" },
  { label: "المقالات", value: "18", icon: FileText, change: "+5 هذا الشهر" },
  { label: "الطلبات الجديدة", value: "7", icon: MessageSquare, change: "+2 هذا الأسبوع" },
  { label: "الزوار", value: "3,847", icon: Eye, change: "+12% عن الشهر الماضي" },
];

const recentRequests = [
  { name: "أحمد الشمري", type: "علامة تجارية", date: "قبل ساعتين", status: "جديد" },
  { name: "نورة العتيبي", type: "حملة تسويقية", date: "قبل 5 ساعات", status: "قيد المراجعة" },
  { name: "خالد المالكي", type: "إنتاج محتوى", date: "أمس", status: "تمت الموافقة" },
  { name: "سارة القحطاني", type: "علامة تجارية", date: "قبل يومين", status: "جديد" },
];

const statusColors: Record<string, string> = {
  "جديد": "bg-blue-500/10 text-blue-400",
  "قيد المراجعة": "bg-yellow-500/10 text-yellow-400",
  "تمت الموافقة": "bg-green-500/10 text-green-400",
};

const DashboardHome = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-border/40 bg-card p-5 transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon size={20} />
            </div>
            <TrendingUp size={14} className="text-green-400" />
          </div>
          <div className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</div>
          <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          <div className="mt-2 text-[10px] text-green-400">{stat.change}</div>
        </motion.div>
      ))}
    </div>

    {/* Recent Requests */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5 }}
      className="rounded-xl border border-border/40 bg-card"
    >
      <div className="border-b border-border/30 p-5">
        <h3 className="text-sm font-bold text-foreground">آخر الطلبات</h3>
      </div>
      <div className="divide-y divide-border/20">
        {recentRequests.map((req, i) => (
          <div key={i} className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30">
            <div className="flex items-center gap-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {req.name.charAt(0)}
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">{req.name}</div>
                <div className="text-xs text-muted-foreground">{req.type}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusColors[req.status]}`}>
                {req.status}
              </span>
              <span className="text-xs text-muted-foreground">{req.date}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

export default DashboardHome;
