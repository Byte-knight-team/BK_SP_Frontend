import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  TableProperties,
  Settings2Icon,
  ClipboardList
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
    exactSearch: true,
    subItems: [
      {
        label: "All Menu Items",
        path: "/admin/menu",
        exactSearch: true,
      },
      {
        label: "Pending Menu Items",
        path: "/admin/menu?status=pending",
      },
      {
        label: "Rejected Menu Items",
        path: "/admin/menu?status=rejected",
      },
    ]
  },
  {
    label: "Chef Update Requests",
    path: "/admin/menu-requests",
    icon: ClipboardList,
  },
];