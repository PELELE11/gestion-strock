import { Routes, Route } from "react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Orders from "@/pages/Orders";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <AppLayoutWrapper>
            <Dashboard />
          </AppLayoutWrapper>
        }
      />
      <Route
        path="/inventory"
        element={
          <AppLayoutWrapper>
            <Inventory />
          </AppLayoutWrapper>
        }
      />
      <Route
        path="/orders"
        element={
          <AppLayoutWrapper>
            <Orders />
          </AppLayoutWrapper>
        }
      />
      <Route
        path="/reports"
        element={
          <AppLayoutWrapper>
            <Reports />
          </AppLayoutWrapper>
        }
      />
      <Route
        path="/settings"
        element={
          <AppLayoutWrapper>
            <Settings />
          </AppLayoutWrapper>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
