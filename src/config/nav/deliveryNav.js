import {
    LayoutDashboard,
    MapPinned,
    ClipboardList,
    Truck,
  } from "lucide-react";
  
  export const deliveryNav = [
    { label: "Dashboard", path: "/delivery", icon: LayoutDashboard, exact: true },
    { label: "Assigned Orders", path: "/delivery/orders", icon: ClipboardList },
    { label: "Routes", path: "/delivery/routes", icon: MapPinned },
    { label: "Delivery Status", path: "/delivery/status", icon: Truck },
  ];