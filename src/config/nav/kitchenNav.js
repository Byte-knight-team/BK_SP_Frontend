import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Package,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export const kitchenNav = [
  { label: "Dashboard", path: "/kitchen", icon: LayoutDashboard, exact: true },
  { label: "Orders", path: "/kitchen/orders", icon: ClipboardList },
  { label: "Chefs", path: "/kitchen/chefs", icon: ChefHat },
  { label: "Inventory", path: "/kitchen/inventory", icon: Package },
  { label: "Menu & Recipes", path: "/kitchen/menu", icon: BookOpen },
  { label: "Approvals", path: "/kitchen/approvals", icon: CheckCircle2 },
];
