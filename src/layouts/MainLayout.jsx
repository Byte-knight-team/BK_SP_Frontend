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
        <main className="custom-scrollbar flex-1 overflow-y-scroll">
          <div className="min-h-[calc(100%+1px)] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {/* Show the SectionHeader if the page provides info */}
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