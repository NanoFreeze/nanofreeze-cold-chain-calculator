import { AuthContext } from "@/Contexts/AuthContext/AuthContext";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import Layout from "@/Components/Layout"
import Clients from "@/Pages/Clients";
import ClientShell from "@/Pages/Clients/ClientShell";
import ClientDetail from "@/Pages/Clients/ClientDetail";
import Contacts from "@/Pages/Clients/Contacts";
import ClientReports from "@/Pages/Clients/ClientReports";
import ClientAlerts from "@/Pages/Clients/ClientAlerts";
import HierarchySettings from "@/Pages/Clients/HierarchySettings";
import PointDetail from "@/Pages/Clients/PointDetail";
import DeviceDetail from "@/Pages/Clients/DeviceDetail";
import Reports from "@/Pages/Reports";
import Alerts from "@/Pages/Alerts";
import Settings from "@/Pages/Settings";

const Router = () => <Routes>
  <Route path="/" element={<Layout><Outlet /></Layout>}>
    <Route index element={<Navigate to="/clients" replace />} />
    <Route path="/clients" element={<Clients />} />
    <Route path="/clients/:id_client" element={<ClientShell />}>
      <Route index element={<ClientDetail />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="reports" element={<ClientReports />} />
      <Route path="alerts" element={<ClientAlerts />} />
      <Route path="hierarchy" element={<HierarchySettings />} />
    </Route>
    <Route path="/clients/:id_client/sale-points/:id_point_of_sale" element={<PointDetail />} />
    <Route path="/clients/:id_client/sale-points/:id_point_of_sale/devices/:id_device" element={<DeviceDetail />} />
    <Route path="/reports" element={<Reports />} />
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/settings" element={<Settings />} />
  </Route>
  <Route path="*" element={<div>404</div>} />
</Routes>

export const ProtectedRoutes = () => {

  const { isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />
  }

  return <Router />
}
