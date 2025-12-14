import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import VoiceCall from "./pages/VoiceCall";
import Payments from "./pages/Payments";
import PurchaseNumbers from "./pages/PurchaseNumbers";
import EnterpriseDashboard from "./pages/EnterpriseDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPanel from "./pages/AdminPanel";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Index />} />
          <Route path="/signup" element={<Index />} />
          <Route path="/demo" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/voice-call" element={<VoiceCall />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/numbers" element={<PurchaseNumbers />} />
          <Route path="/enterprise" element={<EnterpriseDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
