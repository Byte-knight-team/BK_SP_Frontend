import {
  LayoutDashboard,
  ClipboardList,
  History,
  TableProperties,
  CalendarCheck,
} from "lucide-react";

export const receptionistNav = [
  { label: "Dashboard Overview", path: "/receptionist", icon: LayoutDashboard, exact: true },
  { label: "Orders", path: "/receptionist/orders", icon: ClipboardList },
  { label: "Order History", path: "/receptionist/order-history", icon: History },
  { label: "Table Management", path: "/receptionist/tables", icon: TableProperties },
  { label: "Reservations", path: "/receptionist/reservations", icon: CalendarCheck },
];