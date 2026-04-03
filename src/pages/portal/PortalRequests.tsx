import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { MessageSquare, Clock, CheckCircle, FolderOpen, Loader2, Plus, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { requestsService, GuestRequest, RequestStatus } from "@/services/requestsService";
import { cn } from "@/lib/utils";

const statusConfig: Record<RequestStatus, { label: string; className: string; icon: React.ElementType }> = {
  new:       { label: "جديد", className: "bg-blue-500/15 text-blue-600 border-blue-500/30", icon: Clock },
  analysis:  { label: "قيد المراجعة", className: "bg-amber-500/15 text-amber-600 border-amber-500/30", icon: Clock },
  replied:   { label: "تم الرد", className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30", icon: CheckCircle },
  converted: { label: "تحوّل لمشروع", className: "bg-primary/15 text-primary border-primary/30", icon: FolderOpen },
  closed:    { label: "مغلق", className: "bg-muted text-muted-foreground border-border", icon: CheckCircle },
};

const PortalRequests = () => {
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["my-requests"],
    queryFn: () => requestsService.getMyRequests(),
  });

  const counts = {
    new: requests.filter(r => r.status === "new" || r.status === "analysis").length,
    replied: requests.filter(r => r.status === "replied").length,
    converted: requests.filter(r => r.status === "converted").length,
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">طلباتي</h1>
          <p className="text-sm text-muted-foreground mt-1">تتبع جميع طلباتك ومشاريعك المحولة</p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/request">
            <Plus className="h-4 w-4" /> طلب جديد
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "قيد المراجعة", value: counts.new, color: "text-amber-600", bg: "bg-amber-500/10" },
          { label: "تم الرد", value: counts.replied, color: "text-emerald-600", bg: "bg-emerald-500/10" },
          { label: "مشاريع نشطة", value: counts.converted, color: "text-primary", bg: "bg-primary/10" },
        ].map(stat => (
          <div key={stat.label} className={cn("rounded-2xl border border-border/40 p-4 text-center", stat.bg)}>
            <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Requests list */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center border border-dashed border-border/60 rounded-2xl">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">لا توجد طلبات بعد</h3>
            <p className="text-muted-foreground text-sm mt-1">ابدأ بإرسال طلبك الأول وسنتواصل معك قريباً</p>
          </div>
          <Button asChild className="mt-2 gap-2">
            <Link to="/request"><Plus className="h-4 w-4" /> إرسال طلب</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request, i) => {
            const cfg = statusConfig[request.status];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-border/40 bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.className.includes("blue") ? "bg-blue-500/10" : cfg.className.includes("amber") ? "bg-amber-500/10" : cfg.className.includes("emerald") ? "bg-emerald-500/10" : "bg-primary/10")}>
                    <Icon className={cn("h-5 w-5", cfg.className.split(" ")[1])} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-sm leading-snug">{request.project_type}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(request.created_at).toLocaleDateString("ar-SA", { dateStyle: "long" })}
                        </p>
                      </div>
                      <Badge variant="outline" className={cn("text-xs shrink-0", cfg.className)}>
                        {cfg.label}
                      </Badge>
                    </div>

                    {request.details && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{request.details}</p>
                    )}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      {request.budget && (
                        <span className="text-xs text-muted-foreground border border-border/50 rounded-md px-2 py-0.5">
                          {request.budget}
                        </span>
                      )}
                      {request.service_ids && request.service_ids.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {request.service_ids.length} خدمة مطلوبة
                        </span>
                      )}
                      {request.status === "converted" && request.project_id && (
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5 ms-auto" asChild>
                          <Link to={`/portal/projects`}>
                            <FolderOpen className="h-3.5 w-3.5" /> عرض المشروع <ArrowLeft className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                      {request.status === "replied" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1.5 ms-auto border-emerald-500/30 text-emerald-700"
                          onClick={() => toast.info("التواصل مع الفريق متاح قريباً")}
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> عرض الرد
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PortalRequests;
