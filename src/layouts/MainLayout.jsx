import React from "react";
import { Outlet } from "react-router-dom";

const MainLayout = ({ Sidebar, Header}) => {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/*Sidebar for every pages*/}
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/*Header for every pages*/}
        <Header />
        {/*Main content for every pages*/}
        <main className="custom-scrollbar flex-1 overflow-y-auto p-2">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
};

export default MainLayout;
