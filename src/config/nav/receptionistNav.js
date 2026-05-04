import {
  LayoutDashboard,
  ClipboardList,
  TableProperties,
} from "lucide-react";

export const receptionistNav = [
  { label: "Dashboard Overview", path: "/receptionist", icon: LayoutDashboard, exact: true },
  { label: "Orders", path: "/receptionist/orders", icon: ClipboardList },
  { label: "Table Management", path: "/receptionist/tables", icon: TableProperties },
];