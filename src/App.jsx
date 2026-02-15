import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import TableManagement from './pages/TableManagement';
import MenuManagement from './pages/MenuManagement';
import AddMenuItem from './pages/AddMenuItem';
import EditMenuItem from './pages/EditMenuItem';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/tables" element={<TableManagement />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/menu/add" element={<AddMenuItem />} />
          <Route path="/menu/edit" element={<EditMenuItem />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
