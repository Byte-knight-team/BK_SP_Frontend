import Sidebar from "../common/Sidebar";
import {
  RiLayoutMasonryFill,
  RiClipboardLine,
  RiUserSettingsLine,
  RiHandbagLine,
  RiBookOpenLine,
  RiShieldCheckLine,
  RiSettings4Line,
} from "@remixicon/react";

const KitchenSidebar = () => {
  const topLinks = [
    { path: "/kitchen", label: "Dashboard", icon: RiLayoutMasonryFill },
    { path: "/kitchen/orders", label: "Orders", icon: RiClipboardLine },
    { path: "/kitchen/chefs", label: "Chefs", icon: RiUserSettingsLine },
    { path: "/kitchen/inventory", label: "Inventory", icon: RiHandbagLine },
    { path: "/kitchen/menu", label: "Menu & Recipes", icon: RiBookOpenLine },
    { path: "/kitchen/approvals", label: "Approvals", icon: RiShieldCheckLine }
  ];

  const bottomLinks = [
    { path: "/kitchen/settings", label: "Settings", icon: RiSettings4Line },
  ];

  const currentUser = {
    name: "Isuru Udara",
    role: "Chief Chef",
    initials: "IU",
  };

  return (
    <Sidebar
      topLinks={topLinks}
      bottomLinks={bottomLinks}
      panelTitle="Chief Chef Panel"
      user={currentUser}
    />
  );
};

export default KitchenSidebar;
