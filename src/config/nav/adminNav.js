import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  TableProperties,
} from "lucide-react";

export const adminNav = [
  {
    label: "Dashboard",
    path: "/admin-panel",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Staff Management",
    path: "/admin-panel/staff",
    icon: Users,
  },
  {
    label: "Table Management",
    path: "/admin-panel/tables",
    icon: TableProperties,
  },
  {
    label: "Menu Management",
    path: "/admin-panel/menu",
    icon: UtensilsCrossed,
  },
];