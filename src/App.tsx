import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RefreshProvider } from "./contexts/RefreshContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Public Pages
import Index from "./pages/public/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/public/About";
import PublicBlog from "./pages/public/Blog";
import BlogDetail from "./pages/public/BlogDetail";
import Portfolio from "./pages/public/Portfolio";
import ProjectDetails from "./pages/public/ProjectDetails";
import PublicServices from "./pages/public/Services";
import ProjectRequest from "./pages/public/Request";

// Admin Pages & Layout
import AdminDashboardLayout from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import Projects from "./pages/admin/Projects";
import ProjectDetailsAdmin from "./pages/admin/ProjectDetails";
import ProjectForm from "./pages/admin/ProjectForm";
import Requests from "./pages/admin/Requests";
import RequestDetailsAdmin from "./pages/admin/RequestDetails";
import Invoices from "./pages/admin/Invoices";
import InvoiceDetailsAdmin from "./pages/admin/InvoiceDetails";
import InvoiceForm from "./pages/admin/InvoiceForm";
import Clients from "./pages/admin/Clients";
import ClientDetailsAdmin from "./pages/admin/ClientDetails";
import ClientForm from "./pages/admin/ClientForm";
import AdminBlog from "./pages/admin/Blog";
import BlogDetailsAdmin from "./pages/admin/BlogDetails";
import BlogForm from "./pages/admin/BlogForm";
import AdminServices from "./pages/admin/Services";
import ServiceDetailsAdmin from "./pages/admin/ServiceDetails";
import ServiceForm from "./pages/admin/ServiceForm";
import Users from "./pages/admin/Users";
import UserDetailsAdmin from "./pages/admin/UserDetails";
import UserForm from "./pages/admin/UserForm";
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
      <AuthProvider>
        <RefreshProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<PublicServices />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/portfolio/:slug" element={<ProjectDetails />} />
              <Route path="/blog" element={<PublicBlog />} />
              <Route path="/blog/:id" element={<BlogDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/request" element={<ProjectRequest />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardHome />} />

                <Route path="projects" element={<Projects />} />
                <Route path="projects/new" element={<ProjectForm />} />
                <Route path="projects/:id" element={<ProjectDetailsAdmin />} />
                <Route path="projects/:id/edit" element={<ProjectForm />} />

                <Route path="requests" element={<Requests />} />
                <Route path="requests/:id" element={<RequestDetailsAdmin />} />

                <Route path="invoices" element={<Invoices />} />
                <Route path="invoices/new" element={<InvoiceForm />} />
                <Route path="invoices/:id" element={<InvoiceDetailsAdmin />} />
                <Route path="invoices/:id/edit" element={<InvoiceForm />} />

                <Route path="clients" element={<Clients />} />
                <Route path="clients/new" element={<ClientForm />} />
                <Route path="clients/:id" element={<ClientDetailsAdmin />} />
                <Route path="clients/:id/edit" element={<ClientForm />} />

                <Route path="blog" element={<AdminBlog />} />
                <Route path="blog/new" element={<BlogForm />} />
                <Route path="blog/:id" element={<BlogDetailsAdmin />} />
                <Route path="blog/:id/edit" element={<BlogForm />} />

                <Route path="services" element={<AdminServices />} />
                <Route path="services/new" element={<ServiceForm />} />
                <Route path="services/:id" element={<ServiceDetailsAdmin />} />
                <Route path="services/:id/edit" element={<ServiceForm />} />

                <Route path="users" element={<Users />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/:id" element={<UserDetailsAdmin />} />
                <Route path="users/:id/edit" element={<UserForm />} />

                <Route path="site-content" element={<SiteContent />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Client Portal Routes */}
              <Route
                path="/portal"
                element={
                  <ProtectedRoute requiredRole="client">
                    <PortalLayout />
                  </ProtectedRoute>
                }
              >
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
        </RefreshProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
