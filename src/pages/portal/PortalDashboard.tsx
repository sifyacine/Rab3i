import { motion } from "framer-motion";
import { Briefcase, FileText, MessageSquare, ArrowRight, ExternalLink, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PortalDashboard = () => {
  const stats = [
    { title: "مشاريع نشطة", value: "2", icon: Briefcase, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "فواتير غير مدفوعة", value: "1", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "طلباتي", value: "3", icon: MessageSquare, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  const recentProjects = [
    { id: "1", title: "تطبيق ربيعي للمسافرين", status: "قيد التنفيذ", progress: 65 },
    { id: "2", title: "موقع شركة النبراس", status: "مكتمل", progress: 100 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">مرحباً بك مجدداً!</h1>
        <p className="text-muted-foreground mt-2">إليك نظرة سريعة على تقدم مشاريعك وفواتيرك.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>المشاريع الحالية</CardTitle>
            <CardDescription>آخر تحديثات مشاريعك الجارية.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-secondary/20">
                <div>
                  <h4 className="font-semibold text-sm">{project.title}</h4>
                  <p className="text-xs text-muted-foreground">{project.status}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-24 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${project.progress}%` }} />
                  </div>
                  <span className="text-xs font-medium">{project.progress}%</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-2" asChild>
              <Link to="/portal/projects">عرض جميع المشاريع <ArrowRight className="mr-2 h-4 w-4" /></Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="col-span-1 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>تحتاج لمساعدة؟</CardTitle>
            <CardDescription>نحن هنا للمساعدة في أي وقت.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">تواصل معنا مباشرة عبر القنوات التالية للحصول على دعم سريع:</p>
            <div className="grid grid-cols-1 gap-3">
              <Button className="w-full justify-start gap-3 bg-[#25D366] hover:bg-[#20ba56] text-white" asChild>
                <a href="https://wa.me/966500000000" target="_blank" rel="noreferrer">
                  <MessageSquare className="h-4 w-4" /> تواصل عبر WhatsApp
                </a>
              </Button>
              <Button variant="secondary" className="w-full justify-start gap-3" asChild>
                <a href="mailto:support@rabii.sa">
                  <Mail className="h-4 w-4" /> مراسلة البريد الإلكتروني
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default PortalDashboard;
