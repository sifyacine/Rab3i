import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard, Briefcase, FileText, Settings, Users,
  MessageSquare, Star, Building2, LogOut, PanelRight
} from "lucide-react";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarFooter, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const menuItems = [
  { title: "لوحة القيادة", icon: LayoutDashboard, url: "/admin" },
  { title: "المشاريع", icon: Briefcase, url: "/admin/projects" },
  { title: "المدونة", icon: FileText, url: "/admin/blog" },
  { title: "الخدمات", icon: Star, url: "/admin/services" },
  { title: "الطلبات", icon: MessageSquare, url: "/admin/requests" },
  { title: "العملاء", icon: Building2, url: "/admin/clients" },
  { title: "الفواتير", icon: FileText, url: "/admin/invoices" },
  { title: "المستخدمون", icon: Users, url: "/admin/users" },
  { title: "محتوى الموقع", icon: LayoutDashboard, url: "/admin/site-content" },
  { title: "الإعدادات", icon: Settings, url: "/admin/settings" },
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast.success("تم تسجيل الخروج بنجاح");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" side="right">
      <SidebarHeader className="border-b border-border/40 p-4 group-data-[collapsible=icon]:p-2">
        <Link to="/" className="flex items-center justify-center w-full">
          {state === "expanded" ? (
            <img src="/Logo Arabic Version 02.png" alt="ربيعي" className="h-10 w-auto transition-all" />
          ) : (
            <img src="/favicon.png" alt="ربيعي" className="h-8 w-auto transition-all" />
          )}
        </Link>
        <span className="text-[10px] text-muted-foreground text-center group-data-[collapsible=icon]:hidden">لوحة التحكم</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>القائمة الرئيسية</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== "/admin" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className={state === "collapsed" ? "h-8 w-8" : "h-4 w-4"} />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="تسجيل الخروج">
              <LogOut className={state === "collapsed" ? "h-8 w-8" : "h-4 w-4"} />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminHeader() {
  const location = useLocation();
  const current = menuItems.find(
    (m) => m.url === location.pathname || (m.url !== "/admin" && location.pathname.startsWith(m.url))
  );

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border/40 bg-card/50 px-4 backdrop-blur-sm">
      <SidebarTrigger>
        <PanelRight className="h-5 w-5" />
      </SidebarTrigger>
      <h2 className="text-sm font-semibold text-foreground">{current?.title || "لوحة التحكم"}</h2>
    </header>
  );
}

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Route protection is handled by ProtectedRoute component

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AdminSidebar />
        <div className="flex flex-1 flex-col">
          <AdminHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
