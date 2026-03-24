import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import About from "./pages/About";
import PublicBlog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Portfolio from "./pages/Portfolio";
import PublicServices from "./pages/Services";
import ProjectRequest from "./pages/Request";

// Admin Pages & Layout
import AdminDashboardLayout from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import Projects from "./pages/admin/Projects";
import ProjectDetailsAdmin from "./pages/admin/ProjectDetails";
import Requests from "./pages/admin/Requests";
import Invoices from "./pages/admin/Invoices";
import Clients from "./pages/admin/Clients";
import AdminBlog from "./pages/admin/Blog";
import AdminServices from "./pages/admin/Services";
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import SiteContent from "./pages/admin/SiteContent";

// Portal Pages
import PortalLayout from "./components/portal/PortalLayout";
import PortalDashboard from "./pages/portal/PortalDashboard";
import PortalProjects from "./pages/portal/PortalProjects";
import PortalProjectDetails from "./pages/portal/ProjectDetails";
import PortalRequests from "./pages/portal/PortalRequests";
import PortalInvoices from "./pages/portal/PortalInvoices";
import PortalProfile from "./pages/portal/PortalProfile";
import PortalSupport from "./pages/portal/PortalSupport";

// Global & Edge Cases
import Forbidden from "./pages/Forbidden";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/services" element={<PublicServices />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<PublicBlog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/request" element={<ProjectRequest />} />
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetailsAdmin />} />
            <Route path="requests" element={<Requests />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="clients" element={<Clients />} />
            <Route path="blog" element={<AdminBlog />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="users" element={<Users />} />
            <Route path="site-content" element={<SiteContent />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Client Portal Routes */}
          <Route path="/portal" element={<PortalLayout />}>
            <Route index element={<PortalDashboard />} />
            <Route path="projects" element={<PortalProjects />} />
            <Route path="projects/:id" element={<PortalProjectDetails />} />
            <Route path="requests" element={<PortalRequests />} />
            <Route path="invoices" element={<PortalInvoices />} />
            <Route path="profile" element={<PortalProfile />} />
            <Route path="support" element={<PortalSupport />} />
          </Route>

          {/* Edge Cases */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
