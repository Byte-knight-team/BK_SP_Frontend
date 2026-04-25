import {
    LayoutDashboard,
    Users,
    Shield,
    Building2,
    Settings,
    ScrollText,
  } from "lucide-react";
  
  export const adminNav = [
    { label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
    { label: "Staff Management", path: "/admin-panel/staff", icon: Users },
    { label: "Menu Management", path: "/admin/menu", icon: Shield },
    { label: "Table Management", path: "/admin/tables", icon: Building2 },
    { label: "Branch Settings", path: "/settings", icon: ScrollText },
  ];