import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { Navbar } from "@/components/Navbar";
import Index from "./pages/Index";
import Browse from "./pages/Browse";
import SparkArena from "./pages/SparkArena";
import Brainstorm from "./pages/Brainstorm";
import InventionDetail from "./pages/InventionDetail";
import PostInvention from "./pages/PostInvention";
import Login from "./pages/Login";
import Account from "./pages/Account";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/spark-arena" element={<SparkArena />} />
              <Route path="/brainstorm" element={<Brainstorm />} />
              <Route path="/invention/:id" element={<InventionDetail />} />
              <Route path="/post" element={<PostInvention />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<Account />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
