import { RiDashboardLine, RiHistoryLine, RiUserLine } from "@remixicon/react";

export const deliveryNav = [
  {
    path: "/delivery/dashboard",
    label: "Dashboard",
    icon: RiDashboardLine,
    exact: true,
  },
  {
    path: "/delivery/history",
    label: "History",
    icon: RiHistoryLine,
  },
  {
    path: "/delivery/profile",
    label: "Profile",
    icon: RiUserLine,
  },
];