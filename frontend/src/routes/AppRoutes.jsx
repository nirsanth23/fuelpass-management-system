import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PageLoader from "../components/common/PageLoader";

// Lazy-loaded Citizen & Public Pages
const LandingPage = lazy(() => import("../pages/LandingPage"));
const UserLogin = lazy(() => import("../pages/user/UserLogin"));
const UserRegister = lazy(() => import("../pages/user/UserRegister"));
const UserDashboard = lazy(() => import("../pages/user/UserDashboard"));
const UpdateVehicle = lazy(() => import("../pages/user/UpdateVehicle"));
const AddVehicle = lazy(() => import("../pages/user/AddVehicle"));

// Lazy-loaded Admin Pages
const AdminLogin = lazy(() => import("../pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("../pages/admin/AdminLayout"));
const AdminOverview = lazy(() => import("../pages/admin/AdminOverview"));
const QuotaManagement = lazy(() => import("../pages/admin/QuotaManagement"));
const StationManagement = lazy(() => import("../pages/admin/StationManagement"));
const StationSupply = lazy(() => import("../pages/admin/StationSupply"));
const MonthlyReportGenerator = lazy(() => import("../pages/admin/MonthlyReportGenerator"));

// Lazy-loaded Fuel Station Pages
const FuelStationLogin = lazy(() => import("../pages/fuelstation/FuelStationLogin"));
const FuelStationDashboard = lazy(() => import("../pages/fuelstation/FuelStationDashboard"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
          <Route path="monthly-report" element={<MonthlyReportGenerator />} />
        </Route>

        <Route path="/fuelstation/login" element={<FuelStationLogin />} />
        <Route path="/fuelstation/dashboard" element={<FuelStationDashboard />} />
      </Routes>
    </Suspense>
  );
}
