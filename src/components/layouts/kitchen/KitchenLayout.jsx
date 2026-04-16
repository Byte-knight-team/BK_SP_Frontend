import KitchenSidebar from './KitchenSidebar';
import { Outlet } from 'react-router-dom';

export default function KitchenLayout() {
  return (
    // bg-[#0f0e0d] maps to your --bg variable
    <div className="flex h-screen bg-[#F8F9FA] font-sans">
      
      {/* Sidebar fixed width */}
      <KitchenSidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        
        {/* Scrollable Page Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
          <Outlet />
        </main>
      </div>

    </div>
  );
}