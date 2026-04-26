import {
    LayoutDashboard,
    ClipboardList,
    BarChart3,
    Users,
    Package,
  } from "lucide-react";
  
  export const managerNav = [
    { label: "Dashboard", path: "/manager", icon: LayoutDashboard, exact: true },
    { label: "Orders", path: "/manager/orders", icon: ClipboardList },
    { label: "Reports", path: "/manager/reports", icon: BarChart3 },
    { label: "Staff", path: "/manager/staff", icon: Users },
    { label: "Inventory", path: "/manager/inventory", icon: Package },
  ];
