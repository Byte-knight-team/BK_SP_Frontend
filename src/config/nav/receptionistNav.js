import {
    LayoutDashboard,
    ClipboardList,
    TableProperties,
    Settings,
  } from "lucide-react";
  
  export const receptionistNav = [
    { label: "Dashboard Overview", path: "/receptionist", icon: LayoutDashboard, exact: true },
    { label: "Orders", path: "/receptionist/orders", icon: ClipboardList },
    { label: "Table Management", path: "/receptionist/tables", icon: TableProperties },
    { label: "Settings", path: "/receptionist/settings", icon: Settings },
  ];