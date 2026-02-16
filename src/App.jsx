import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UserManagement from "./pages/UserManagement";
import RolesPermissions from "./pages/RolesPermissions";
import BranchManagement from "./pages/BranchManagement";
import SystemSettings from "./pages/SystemSettings";
import Login from "./pages/Login";


export default function App() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // we created a state to check whether the sidebar is collapsed or not.
  const [isAuthenticated, setIsAuthenticated] = useState(false); // what we did here is we created a state to check whether the user is authenticated or not.
  const [user, setUser] = useState(null); // we created a state to store the user data.
  const [activePage, setActivePage] = useState("users"); // we created a state to store the active page.

  const handleLogin = (userData) => { // this function is called when the user logs in.
    setUser(userData); // we set the user data to the user state.
    setActivePage("users"); // we set the active page to users.
    setIsAuthenticated(true); // we set the isAuthenticated state to true.
  };

  const handleLogout = () => { // this function is called when the user logs out.
    setUser(null); // we set the user state to null.
    setIsAuthenticated(false); // we set the isAuthenticated state to false.
  };

  const renderPage = () => {
    switch (activePage) {
      case "users":
        return <UserManagement />;
      case "roles":
        return <RolesPermissions />;
      case "branches":
        return <BranchManagement />;
      case "settings":
        return <SystemSettings />;
      default:
        return <UserManagement />;
    }
  };

  const toggleSidebar = () => { // this function is called when the user clicks the toggle button.
    setIsSidebarCollapsed((prev) => !prev);
  };  

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar 
        active page={activePage}
        onPageChange={setActivePage}
        onLogout={handleLogout}
        user={user}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        {renderPage()}
      </div>
    </div>
  );
}
