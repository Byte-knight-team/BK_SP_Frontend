import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Package,
  UtensilsCrossed,
  CheckCircle2,
} from "lucide-react";

export const kitchenNav = [
  { label: "Dashboard", path: "/kitchen", icon: LayoutDashboard, exact: true },
  { label: "Orders", path: "/kitchen/orders", icon: ClipboardList },
  { label: "Chefs", path: "/kitchen/chefs", icon: ChefHat },
  { label: "Inventory", path: "/kitchen/inventory", icon: Package },
  { label: "Menu Items", path: "/kitchen/menu", icon: UtensilsCrossed },
  { label: "Approvals", path: "/kitchen/approvals", icon: CheckCircle2 },
];
