import Sidebar from "../common/Sidebar"
import { 
  RiLayoutMasonryFill, 
  RiClipboardLine, 
  RiTableLine, 
  RiSettings4Line 
} from "@remixicon/react";

const ReceptionistSidebar = () => {
  const topLinks = [
    { path: "/receptionist", label: "Dashboard Overview", icon: RiLayoutMasonryFill },
    { path: "/receptionist/orders", label: "Orders", icon: RiClipboardLine },
    { path: "/receptionist/tables", label: "Table Management", icon: RiTableLine },
  ];

  const bottomLinks = [
    { path: "/receptionist/settings", label: "Settings", icon: RiSettings4Line },
  ];

  const currentUser = { 
    name: "Isuru Udara", 
    role: "Receptionist", 
    initials: "IU" 
  };

  return (
    <Sidebar 
      topLinks={topLinks} 
      bottomLinks={bottomLinks}
      panelTitle="Receptionist Panel" 
      user={currentUser} 
    />
  );
};

export default ReceptionistSidebar;