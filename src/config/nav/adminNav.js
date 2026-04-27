import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  TableProperties,
  Settings2Icon,
} from "lucide-react";

export const adminNav = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Staff Management",
    path: "/admin/staff",
    icon: Users,
  },
  {
    label: "Table Management",
    path: "/admin/tables",
    icon: TableProperties,
  },
  {
    label: "Menu Management",
    path: "/admin/menu",
    icon: UtensilsCrossed,
  },
  {
    label: "Coupons",
    path: "/admin/coupons",
    icon: Settings2Icon,
  },
];