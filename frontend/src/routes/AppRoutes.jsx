import { Routes, Route } from "react-router-dom";
import RoleSelection from "../pages/RoleSelection";
import UserLogin from "../pages/user/UserLogin";
import UserRegister from "../pages/user/UserRegister";
import UserDashboard from "../pages/user/UserDashboard";
import AdminLogin from "../pages/admin/AdminLogin";
import FuelStationLogin from "../pages/fuelstation/FuelStationLogin";

import AdminLayout from "../pages/admin/AdminLayout";
import AdminOverview from "../pages/admin/AdminOverview";
import QuotaManagement from "../pages/admin/QuotaManagement";
import StationManagement from "../pages/admin/StationManagement";
import StationSupply from "../pages/admin/StationSupply";

import FuelStationDashboard from "../pages/fuelstation/FuelStationDashboard";
import UpdateVehicle from "../pages/user/UpdateVehicle";
import AddVehicle from "../pages/user/AddVehicle";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route path="/user/register" element={<UserRegister />} />
      <Route path="/user/dashboard" element={<UserDashboard />} />
      <Route path="/user/update-vehicle" element={<UpdateVehicle />} />
      <Route path="/user/add-vehicle" element={<AddVehicle />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      {/* Refactored Admin Routes */}
      <Route path="/admin/dashboard" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="quota" element={<QuotaManagement />} />
        <Route path="stations" element={<StationManagement />} />
        <Route path="supply" element={<StationSupply />} />
      </Route>

      <Route path="/fuelstation/login" element={<FuelStationLogin />} />
      <Route path="/fuelstation/dashboard" element={<FuelStationDashboard />} />
    </Routes>
  );
}