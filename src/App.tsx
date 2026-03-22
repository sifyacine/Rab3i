import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import Services from "./pages/Services";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Request from "./pages/Request";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import DashboardHome from "./pages/admin/DashboardHome";
import ProjectsAdmin from "./pages/admin/Projects";
import BlogAdmin from "./pages/admin/Blog";
import ServicesAdmin from "./pages/admin/Services";
import ClientsAdmin from "./pages/admin/Clients";
import RequestsAdmin from "./pages/admin/Requests";
import UsersAdmin from "./pages/admin/Users";
import SettingsAdmin from "./pages/admin/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/request" element={<Request />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<DashboardHome />} />
            <Route path="projects" element={<ProjectsAdmin />} />
            <Route path="blog" element={<BlogAdmin />} />
            <Route path="services" element={<ServicesAdmin />} />
            <Route path="clients" element={<ClientsAdmin />} />
            <Route path="requests" element={<RequestsAdmin />} />
            <Route path="users" element={<UsersAdmin />} />
            <Route path="settings" element={<SettingsAdmin />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);

export default App;
