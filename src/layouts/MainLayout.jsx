import { Outlet } from "react-router-dom";
import { useState } from "react";
import SectionHeader from "../components/common/SectionHeader";

const MainLayout = ({ Sidebar, Header }) => {
  const [headerInfo, setHeaderInfo] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for every page */}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header for every page */}
        <Header />

        {/* Main content for every page */}
        <main className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 py-3">
          {headerInfo && (
            <SectionHeader
              title={headerInfo.title}
              description={headerInfo.description}
              Icon={headerInfo.Icon}
            />
          )}

          <Outlet context={{ setHeaderInfo }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;