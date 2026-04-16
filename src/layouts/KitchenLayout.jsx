import React from 'react';
import { Outlet } from 'react-router-dom';
import KitchenSidebar from '../components/kitchen/KitchenSidebar';
import KitchenHeader from '../components/kitchen/KitchenHeader';

const KitchenLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* 1. ස්ථාවරව පවතින Sidebar එක */}
      <KitchenSidebar />

      {/* 2. දකුණු පැත්තේ තියෙන මුළු ප්‍රදේශය */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* 3. හැම පේජ් එකකම උඩින්ම තියෙන Header එක */}
        <KitchenHeader />
        
        {/* 4. පේජ් එකෙන් පේජ් එකට වෙනස් වෙන Content එක */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
           <Outlet />
        </main>
      </div>
    </div>
  );
};

export default KitchenLayout;



// import KitchenSidebar from './KitchenSidebar';
// import { Outlet } from 'react-router-dom';

// export default function KitchenLayout() {
//   return (
//     // bg-[#0f0e0d] maps to your --bg variable
//     <div className="flex h-screen bg-[#F8F9FA] font-sans">
      
//       {/* Sidebar fixed width */}
//       <KitchenSidebar />

//       {/* Main Content Area */}
//       <div className="flex flex-col flex-1 overflow-hidden">
        
//         {/* Scrollable Page Content */}
//         <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FAFAFA]">
//           <Outlet />
//         </main>
//       </div>

//     </div>
//   );
// }