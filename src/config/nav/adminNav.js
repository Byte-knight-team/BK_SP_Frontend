import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Settings,
  ScrollText,
  UtensilsCrossed,
  Table2Icon,
  TableProperties,
  Settings2Icon,
} from "lucide-react";

export const adminNav = [
  { label: "Dashboard", path: "/admin-panel", icon: LayoutDashboard, exact: true },
  { label: "Staff Management", path: "/admin-panel/staff", icon: Users },
  { label: "Menu Management", path: "/admin-panel/menu", icon: UtensilsCrossed },
  { label: "Table Management", path: "/admin-panel/tables", icon: TableProperties },
  { label: "Branch Settings", path: "admin-panel/settings", icon: Settings2Icon },
];