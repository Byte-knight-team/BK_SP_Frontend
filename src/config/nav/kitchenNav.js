import {
  LayoutDashboard,
  ClipboardList,
  History,
  ChefHat,
  Package,
  PackageCheck,
  UtensilsCrossed,
} from "lucide-react";

export const kitchenNav = [
  { label: "Dashboard", path: "/kitchen", icon: LayoutDashboard, exact: true },
  { label: "Orders", path: "/kitchen/orders", icon: ClipboardList },
  { label: "Order History", path: "/kitchen/order-history", icon: History },
  { label: "Chefs", path: "/kitchen/chefs", icon: ChefHat },
  { label: "Inventory", path: "/kitchen/inventory", icon: Package },
  { label: "Menu Items", path: "/kitchen/menu", icon: UtensilsCrossed },
  { label: "My Requests", path: "/kitchen/requests", icon: PackageCheck },
];
