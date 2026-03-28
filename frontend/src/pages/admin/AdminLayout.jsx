import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";

const AdminLayout = () => {
  return (
    <div className="h-screen bg-[#0B1220] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
