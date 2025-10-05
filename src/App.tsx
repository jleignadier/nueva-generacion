
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import AdminLayout from "./layouts/AdminLayout";
import UserLayout from "./layouts/UserLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEvents from "./pages/admin/AdminEvents";
import EventForm from "./pages/admin/EventForm";
import AdminDonations from "./pages/admin/AdminDonations";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrganizations from "./pages/admin/AdminOrganizations";
import AdminSettings from "./pages/admin/AdminSettings";
import HomeTab from "./pages/tabs/HomeTab";
import DonationsTab from "./pages/tabs/DonationsTab";
import LeaderboardTab from "./pages/tabs/LeaderboardTab";
import ProfileTab from "./pages/tabs/ProfileTab";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* User Routes */}
            <Route element={<UserLayout />}>
              <Route path="/dashboard" element={<HomeTab />} />
              <Route path="/events" element={<Events />} />
              <Route path="/dashboard/donations" element={<DonationsTab />} />
              <Route path="/dashboard/leaderboard" element={<LeaderboardTab />} />
              <Route path="/dashboard/profile" element={<ProfileTab />} />
              <Route path="/dashboard/events/:id" element={<EventDetail />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/events/create" element={<EventForm />} />
              <Route path="/admin/events/edit/:id" element={<EventForm />} />
              <Route path="/admin/donations" element={<AdminDonations />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/organizations" element={<AdminOrganizations />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
            </Route>
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
