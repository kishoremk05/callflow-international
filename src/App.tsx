import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VoiceCall from "./pages/VoiceCall";
import Payments from "./pages/Payments";
import PurchaseNumbers from "./pages/PurchaseNumbers";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import CompanyAdminLogin from "./pages/CompanyAdminLogin";
import CompanyAdminRegister from "./pages/CompanyAdminRegister";
import CompanyAdminDashboard from "./pages/CompanyAdminDashboard";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import NotFound from "./pages/NotFound";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import API from "./pages/API";
import AboutUs from "./pages/AboutUs";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import AccountTypeSelection from "./pages/AccountTypeSelection";
import AuthCallback from "./pages/AuthCallback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Index />} />
          <Route path="/signup" element={<Index />} />
          <Route path="/demo" element={<Index />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/account-type-selection"
            element={<AccountTypeSelection />}
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/voice-call" element={<VoiceCall />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/numbers" element={<PurchaseNumbers />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/company-admin/login" element={<CompanyAdminLogin />} />
          <Route
            path="/company-admin/register"
            element={<CompanyAdminRegister />}
          />
          <Route
            path="/company-admin/dashboard"
            element={<CompanyAdminDashboard />}
          />
          <Route path="/super-admin/login" element={<SuperAdminLogin />} />
          <Route
            path="/super-admin/dashboard"
            element={<SuperAdminDashboard />}
          />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/api" element={<API />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/cookies" element={<CookiePolicy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
