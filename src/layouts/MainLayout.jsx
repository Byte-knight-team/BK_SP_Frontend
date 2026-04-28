import { Outlet } from "react-router-dom";
import SectionHeader from "../components/common/SectionHeader";
import { useState } from "react";

const MainLayout = ({ Sidebar, Header }) => {
  const [headerInfo, setHeaderInfo] = useState(null);
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/*Sidebar for every pages*/}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/*Header for every pages*/}
        <Header />
        {/*Main content for every pages*/}
        <main className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden p-4">
          {/* show the SectionHeader if the page provides info */}
          {headerInfo && (
            <SectionHeader
              title={headerInfo.title}
              description={headerInfo.description}
              Icon={headerInfo.Icon}
            />
          )}
          {/* pass setHeaderInfo to all pages via context */}
          <Outlet context={{ setHeaderInfo }} />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
