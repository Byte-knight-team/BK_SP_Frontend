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
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Staff Management", path: "/admin/staff", icon: Users },
  { label: "Menu Management", path: "/admin/menu", icon: UtensilsCrossed },
  { label: "Table Management", path: "/admin/tables", icon: TableProperties },
  { label: "Coupons", path: "/admin/coupons", icon: Settings2Icon },
];