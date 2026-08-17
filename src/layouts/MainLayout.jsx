import { Outlet } from "react-router-dom";
import { useState } from "react";
import SectionHeader from "../components/common/SectionHeader";

const MainLayout = ({ Sidebar, Header, contentClassName = "" }) => {
  const [headerInfo, setHeaderInfo] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar for every page */}
      <Sidebar />

      {/* Main application area */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header for every page */}
        <Header />

        {/* This is the ONLY vertical scroll area */}
        <main className="custom-scrollbar min-h-0 flex-1 overflow-y-auto">
          <div
            className={`min-h-full px-4 py-5 sm:px-6 lg:px-8 lg:py-7 ${contentClassName}`}
          >
            {/* Shared section header */}
            {headerInfo && (
              <SectionHeader
                title={headerInfo.title}
                description={headerInfo.description}
                Icon={headerInfo.Icon}
              />
            )}

            <Outlet context={{ setHeaderInfo }} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;