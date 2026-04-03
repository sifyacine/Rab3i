import { motion } from "framer-motion";
import { Briefcase, MessageSquare, Users, TrendingUp, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectsService } from "@/services/projectsService";
import { requestsService, RequestStatus } from "@/services/requestsService";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const statusColors: Record<RequestStatus, string> = {
  new: "bg-blue-500/10 text-blue-400",
  analysis: "bg-yellow-500/10 text-yellow-400",
  replied: "bg-emerald-500/10 text-emerald-400",
  converted: "bg-primary/10 text-primary",
  closed: "bg-muted text-muted-foreground",
};

const statusLabels: Record<RequestStatus, string> = {
  new: "جديد",
  analysis: "قيد المراجعة",
  replied: "تم الرد",
  converted: "تحوّل لمشروع",
  closed: "مغلق",
};

const DashboardHome = () => {
  const navigate = useNavigate();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => projectsService.getProjectStats(),
  });

  const { data: recentRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ["admin-recent-requests"],
    queryFn: () => requestsService.getRecentRequests(5),
  });

  const isLoading = statsLoading || requestsLoading;

  const statCards = [
    { label: "المشاريع", value: stats?.projects || 0, icon: Briefcase, color: "text-blue-400" },
    { label: "الطلبات الجديدة", value: stats?.newRequests || 0, icon: MessageSquare, color: "text-amber-400" },
    { label: "إجمالي الطلبات", value: stats?.totalRequests || 0, icon: TrendingUp, color: "text-emerald-400" },
    { label: "العملاء النشطون", value: stats?.projects || 0, icon: Users, color: "text-primary" },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, i) => (
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
              <TrendingUp size={14} className={stat.color} />
            </div>
            <div className="text-2xl font-bold text-foreground tabular-nums">
              {stat.value.toLocaleString("ar-SA")}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Recent Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="rounded-xl border border-border/40 bg-card overflow-hidden"
      >
        <div className="flex items-center justify-between border-b border-border/30 p-5">
          <h3 className="text-sm font-bold text-foreground">آخر الطلبات</h3>
          <button 
            onClick={() => navigate("/admin/requests")}
            className="text-xs text-primary hover:underline transition-all"
          >
            عرض الكل
          </button>
        </div>
        <div className="divide-y divide-border/20">
          {recentRequests && recentRequests.length > 0 ? (
            recentRequests.map((req, i) => (
              <div 
                key={req.id} 
                className="flex items-center justify-between p-4 transition-colors hover:bg-secondary/30 cursor-pointer"
                onClick={() => navigate(`/admin/requests/${req.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {req.guest_name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{req.guest_name}</div>
                    <div className="text-xs text-muted-foreground">{req.project_type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${statusColors[req.status]}`}>
                    {statusLabels[req.status]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: ar })}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-10 text-center text-muted-foreground text-sm">
              لا توجد طلبات جديدة حالياً
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
