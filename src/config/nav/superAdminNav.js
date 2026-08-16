import {
  RiDashboardLine,
  RiUserSettingsLine,
  RiShieldUserLine,
  RiBuildingLine,
  RiSettings3Line,
  RiFileList3Line,
  RiFileChartLine,
  RiLayoutGridLine,
  RiPriceTag3Line,
} from "@remixicon/react";

export const superAdminNav = [
  { label: "Dashboard", path: "/staff", icon: RiDashboardLine, exact: true },
  { label: "Staff Management", path: "/staff/staff", icon: RiUserSettingsLine },
  { label: "Customer Management", path: "/staff/customers", icon: RiShieldUserLine },
  { label: "Roles & Permissions", path: "/staff/roles", icon: RiShieldUserLine },
  { label: "Branch Management", path: "/staff/branches", icon: RiBuildingLine },
  { label: "Category Management", path: "/staff/categories", icon: RiLayoutGridLine },
  { label: "Coupons", path: "/staff/coupons", icon: RiPriceTag3Line },
  { label: "System Configuration", path: "/staff/config", icon: RiSettings3Line },
  { label: "Audit Logs", path: "/staff/audit", icon: RiFileList3Line },
  { label: "Reports", path: "/staff/reports", icon: RiFileChartLine },
];
