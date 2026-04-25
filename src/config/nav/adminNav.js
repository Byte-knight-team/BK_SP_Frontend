import {
    LayoutDashboard,
    Users,
    Shield,
    Building2,
    Settings,
    ScrollText,
  } from "lucide-react";
  
  export const adminNav = [
    { label: "Dashboard", path: "/admin-panel", icon: LayoutDashboard, exact: true },
    { label: "Staff Management", path: "/admin-panel/staff", icon: Users },
    { label: "Menu Management", path: "/admin-panel/roles", icon: Shield },
    { label: "Table Management", path: "/admin-panel/branches", icon: Building2 },
    { label: "Branch Settings", path: "/admin-panel/audit", icon: ScrollText },
  ];