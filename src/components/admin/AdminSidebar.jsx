import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import AppSidebar from "../common/AppSidebar";
import { adminNav } from "../../config/nav/adminNav";
import { getMenuItemsAPI } from "../../apis/admin/menu";
import { getMenuUpdateRequestsAPI } from "../../apis/admin/menuUpdateRequests";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: menuItems = [] } = useQuery({
    queryKey: ['menuItems'],
    queryFn: getMenuItemsAPI,
    staleTime: 5 * 60 * 1000,
  });

  const { data: updateRequests = [] } = useQuery({
    queryKey: ['menuUpdateRequests', 'PENDING'],
    queryFn: () => getMenuUpdateRequestsAPI('PENDING'),
    staleTime: 5 * 60 * 1000,
  });

  const pendingUpdateRequestsCount = updateRequests.length;

  const dynamicNav = useMemo(() => {
    const pendingCount = menuItems.filter(
      (item) => (item.status || "").toUpperCase() === "PENDING"
    ).length;
    const rejectedCount = menuItems.filter(
      (item) => (item.status || "").toUpperCase() === "REJECTED"
    ).length;

    return adminNav.map((item) => {
      if (item.label === "Menu Management" && item.subItems) {
        return {
          ...item,
          subItems: item.subItems.map((sub) => {
            if (sub.label === "All Menu Items") {
              return { ...sub, count: menuItems.length };
            }
            if (sub.label === "Pending Menu Items") {
              return { ...sub, count: pendingCount };
            }
            if (sub.label === "Rejected Menu Items") {
              return { ...sub, count: rejectedCount };
            }
            return sub;
          }),
        };
      }
      
      if (item.label === "Chef Update Requests" && pendingUpdateRequestsCount > 0) {
        return {
          ...item,
          count: pendingUpdateRequestsCount
        };
      }
      
      return item;
    });
  }, [menuItems, pendingUpdateRequestsCount]);

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={dynamicNav}
      branchName={user?.branchName || "Admin Access"}
      userName={user?.username || user?.email || "Admin"}
      roleLabel={user?.roleName || "ADMIN"}
      profilePath="/admin/profile"
      onLogout={handleLogout}
    />
  );
}