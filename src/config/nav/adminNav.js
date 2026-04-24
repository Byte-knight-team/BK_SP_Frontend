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
    { label: "Roles & Permissions", path: "/admin-panel/roles", icon: Shield },
    { label: "Branch Management", path: "/admin-panel/branches", icon: Building2 },
    { label: "System Configuration", path: "/admin-panel/config", icon: Settings },
    { label: "Audit Logs", path: "/admin-panel/audit", icon: ScrollText },
  ];