import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";

import ReceptionLayout from "./components/layout/ReceptionLayout";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";
import OrderListPage from "./pages/OrderListPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import TableManagementPage from "./pages/TableManagementPage";
import StatisticsPage from "./pages/StatisticsPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/reception/dashboard" />} />

        <Route path="/reception" element={<ReceptionLayout />}>
          <Route path="dashboard" element={<ReceptionistDashboard />} />
          <Route path="orders" element={<OrderListPage />} />
          <Route path="orders/:id" element={<OrderDetailPage />} />
          <Route path="tables" element={<TableManagementPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

