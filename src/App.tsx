
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import AdminRoute from "@/components/AdminRoute";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import HomeTab from "./pages/tabs/HomeTab";
import DonationsTab from "./pages/tabs/DonationsTab";
import LeaderboardTab from "./pages/tabs/LeaderboardTab";
import ProfileTab from "./pages/tabs/ProfileTab";
import AdminHomeTab from "./pages/admin/tabs/AdminHomeTab";
import AdminEventsTab from "./pages/admin/tabs/AdminEventsTab";
import AdminDonationsTab from "./pages/admin/tabs/AdminDonationsTab";
import AdminUsersTab from "./pages/admin/tabs/AdminUsersTab";
import AdminSettingsTab from "./pages/admin/tabs/AdminSettingsTab";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<HomeTab />} />
              <Route path="donations" element={<DonationsTab />} />
              <Route path="leaderboard" element={<LeaderboardTab />} />
              <Route path="profile" element={<ProfileTab />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }>
              <Route index element={<AdminHomeTab />} />
              <Route path="events" element={<AdminEventsTab />} />
              <Route path="donations" element={<AdminDonationsTab />} />
              <Route path="users" element={<AdminUsersTab />} />
              <Route path="settings" element={<AdminSettingsTab />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
