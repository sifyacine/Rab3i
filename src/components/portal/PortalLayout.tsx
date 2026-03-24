import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Briefcase, FileText, MessageSquare, LogOut, PanelRight, Phone, Mail, User, Moon, Sun
} from "lucide-react";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarFooter, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const menuItems = [
  { title: "الرئيسية", icon: LayoutDashboard, url: "/portal" },
  { title: "مشاريعي", icon: Briefcase, url: "/portal/projects" },
  { title: "طلباتي", icon: MessageSquare, url: "/portal/requests" },
  { title: "الفواتير", icon: FileText, url: "/portal/invoices" },
  { title: "الملف الشخصي", icon: User, url: "/portal/profile" },
  { title: "الدعم الفني", icon: MessageSquare, url: "/portal/support" },
];

function PortalSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("rabii_portal_auth");
    toast.success("تم تسجيل الخروج من بوابة العملاء");
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
        <span className="text-[10px] text-muted-foreground text-center group-data-[collapsible=icon]:hidden">بوابة العملاء</span>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>قائمة العميل</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location.pathname === item.url ||
                  (item.url !== "/portal" && location.pathname.startsWith(item.url));
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className={state === "collapsed" ? "h-6 w-6" : "h-4 w-4"} />
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
              <LogOut className={state === "collapsed" ? "h-6 w-6" : "h-4 w-4"} />
              <span>تسجيل الخروج</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function PortalHeader() {
  const location = useLocation();
  const current = menuItems.find(
    (m) => m.url === location.pathname || (m.url !== "/portal" && location.pathname.startsWith(m.url))
  );

  return (
    <header className="flex h-14 items-center gap-3 border-b border-border/40 bg-card/50 px-4 backdrop-blur-sm">
      <SidebarTrigger>
        <PanelRight className="h-5 w-5" />
      </SidebarTrigger>
      <h2 className="text-sm font-semibold text-foreground">{current?.title || "بوابة العملاء"}</h2>
      <div className="mr-auto flex items-center gap-4">
        <a href="tel:+966500000000" className="text-muted-foreground hover:text-primary transition-colors">
          <Phone className="h-4 w-4" />
        </a>
        <a href="mailto:support@rabii.sa" className="text-muted-foreground hover:text-primary transition-colors">
          <Mail className="h-4 w-4" />
        </a>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => document.documentElement.classList.toggle("light")}
          className="h-9 w-9 text-muted-foreground hover:text-primary"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all light:rotate-90 light:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all light:rotate-0 light:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  );
}

const PortalLayout = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <PortalSidebar />
        <div className="flex flex-1 flex-col">
          <PortalHeader />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default PortalLayout;
